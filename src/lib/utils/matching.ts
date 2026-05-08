// Advanced job matching algorithm
import { Job, Candidate, CandidateMatch, JobMatch } from '../types/api';
import { dataStore } from '../storage/dataStore';

export interface MatchScore {
  score: number; // 0-100
  details: {
    skillsMatch: number;
    locationMatch: number;
    experienceMatch: number;
  };
  reason: string;
}

export class MatchingEngine {
  /**
   * Calculate match score between a job and candidate
   */
  static calculateJobCandidateMatch(job: Job, candidate: Candidate): MatchScore {
    let totalScore = 0;
    const details = {
      skillsMatch: 0,
      locationMatch: 0,
      experienceMatch: 0,
    };

    // Skills matching (40% weight)
    const candidateSkills = candidate.profile.skills.map((s) =>
      s.toLowerCase()
    );
    const jobSkills = job.skills.map((s) => s.toLowerCase());

    const matchedSkills = jobSkills.filter((s) =>
      candidateSkills.some((cs) => cs.includes(s) || s.includes(cs))
    ).length;

    const skillsScore =
      jobSkills.length > 0
        ? (matchedSkills / jobSkills.length) * 100
        : 50;

    details.skillsMatch = skillsScore;
    totalScore += skillsScore * 0.4;

    // Location matching (30% weight)
    const candidateLocation = candidate.profile.location.toLowerCase();
    const jobLocation = job.location.toLowerCase();

    const locationScore =
      candidateLocation.includes(jobLocation) ||
      jobLocation.includes(candidateLocation) ||
      this.citiesNearby(candidateLocation, jobLocation)
        ? 100
        : candidateLocation.includes('remote') ||
          jobLocation.includes('remote')
        ? 80
        : 30;

    details.locationMatch = locationScore;
    totalScore += locationScore * 0.3;

    // Experience matching (30% weight)
    const candidateExp = parseInt(candidate.profile.experience) || 0;
    const jobExpParts = job.experience.match(/\d+/);
    const jobExpRequired = jobExpParts ? parseInt(jobExpParts[0]) : 0;

    let experienceScore = 0;
    if (jobExpRequired === 0) {
      experienceScore = 100;
    } else if (candidateExp >= jobExpRequired) {
      // Candidate has sufficient or more experience
      experienceScore = Math.min(100, 100 + (candidateExp - jobExpRequired) * 5);
    } else {
      // Candidate has less experience
      const diff = jobExpRequired - candidateExp;
      experienceScore = Math.max(0, 100 - diff * 15);
    }

    details.experienceMatch = experienceScore;
    totalScore += experienceScore * 0.3;

    // Round to 0-100
    const finalScore = Math.min(100, Math.max(0, Math.round(totalScore)));

    return {
      score: finalScore,
      details,
      reason: this.generateMatchReason(finalScore, details),
    };
  }

  /**
   * Get job recommendations for a candidate
   */
  static getJobRecommendations(
    candidateId: string,
    limit: number = 5
  ): JobMatch[] {
    const candidate = dataStore.getCandidateById(candidateId);
    if (!candidate) return [];

    const allJobs = dataStore.getAllJobs();
    const matches: JobMatch[] = [];

    for (const job of allJobs) {
      // Skip if already applied or saved
      if (
        candidate.applications.some(
          (appId) => dataStore.getApplicationById(appId)?.jobId === job.id
        ) ||
        candidate.savedJobs.includes(job.id)
      ) {
        continue;
      }

      const matchScore = this.calculateJobCandidateMatch(job, candidate);

      // Only include jobs with decent match score
      if (matchScore.score >= 50) {
        matches.push({
          job,
          matchScore: matchScore.score,
          matchReason: matchScore.reason,
        });
      }
    }

    // Sort by score descending and return top N
    return matches
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);
  }

  /**
   * Get candidate recommendations for a job
   */
  static getCandidateRecommendations(
    jobId: string,
    limit: number = 5
  ): CandidateMatch[] {
    const job = dataStore.getJobById(jobId);
    if (!job) return [];

    const allCandidates = dataStore.getAllCandidates();
    const matches: CandidateMatch[] = [];

    for (const candidate of allCandidates) {
      // Skip if already applied
      if (
        candidate.applications.some(
          (appId) => dataStore.getApplicationById(appId)?.jobId === job.id
        )
      ) {
        continue;
      }

      const matchScore = this.calculateJobCandidateMatch(job, candidate);

      // Only include candidates with decent match score
      if (matchScore.score >= 50) {
        matches.push({
          candidate,
          matchScore: matchScore.score,
          matchReason: matchScore.reason,
        });
      }
    }

    // Sort by score descending and return top N
    return matches
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);
  }

  /**
   * Simple similarity check for nearby cities (could be enhanced with real geolocation)
   */
  private static citiesNearby(city1: string, city2: string): boolean {
    const regions: Record<string, string[]> = {
      'north': ['tiranë', 'durrës', 'lezhe', 'shkodër'],
      'south': ['vlore', 'sarande', 'gjirokaster', 'himara'],
      'center': ['elbasan', 'peqin', 'rrogozhine'],
      'east': ['prishtine', 'gjakove', 'peje', 'prizren'],
    };

    for (const [, cities] of Object.entries(regions)) {
      if (cities.includes(city1) && cities.includes(city2)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Generate human-readable match reason
   */
  private static generateMatchReason(
    score: number,
    details: MatchScore['details']
  ): string {
    if (score >= 90) {
      return 'Përputhje e shkëlqyer! Ju jeni kandidat ideal për këtë pozitë.';
    } else if (score >= 75) {
      return 'Përputhje e mirë. Keni shumë nga cilësitë që kërkohen.';
    } else if (score >= 60) {
      return 'Përputhje e pranueshme. Ju keni disa cilësi kyçe.';
    } else {
      const weakestArea =
        details.skillsMatch < details.locationMatch &&
        details.skillsMatch < details.experienceMatch
          ? 'aftësitë'
          : details.locationMatch < details.experienceMatch
          ? 'vendndodhja'
          : 'përvojë';
      return `Përputhje e dobët. Punoni në zhvillimin e ${weakestArea} tuaj.`;
    }
  }

  /**
   * Get diversity score for a job listing
   * Higher score = more diverse candidate pool
   */
  static getDiversityScore(jobId: string): number {
    const candidates = this.getCandidateRecommendations(jobId, 50);
    if (candidates.length === 0) return 0;

    // Average experience across recommendations
    const experiences = candidates.map((c) =>
      parseInt(c.candidate.profile.experience) || 0
    );
    const avgExp =
      experiences.reduce((a, b) => a + b, 0) / experiences.length;
    const expVariance =
      experiences.reduce((acc, exp) => acc + Math.pow(exp - avgExp, 2), 0) /
      experiences.length;

    // Normalize diversity score (0-100)
    return Math.min(100, Math.sqrt(expVariance) * 10);
  }
}

export default MatchingEngine;
