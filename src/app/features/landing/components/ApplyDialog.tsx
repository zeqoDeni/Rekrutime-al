import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import { Button } from '@/app/shared/ui/button';
import { Label } from '@/app/shared/ui/label';
import { Textarea } from '@/app/shared/ui/textarea';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/app/shared/ui/dialog';
import { applyToMarketplaceJob, type MarketplaceJob } from '@/lib/marketplace';
import { toast } from 'sonner';

interface ApplyDialogProps {
  job: MarketplaceJob;
  isApplied: boolean;
  onApplied: (jobId: string) => void;
}

export function ApplyDialog({ job, isApplied, onApplied }: ApplyDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [experience, setExperience] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user || user.type !== 'candidate') {
    return (
      <Button asChild className="rounded-md">
        <Link to="/login">Hyni për të aplikuar</Link>
      </Button>
    );
  }

  if (isApplied) {
    return (
      <Button asChild variant="outline" className="rounded-md">
        <Link to="/dashboard/candidate">
          <CheckCircle2 className="size-4 mr-2 text-green-600" />
          Keni aplikuar
        </Link>
      </Button>
    );
  }

  async function handleSubmit() {
    if (!user) return;

    if (!user.name?.trim()) {
      toast.error('Plotësoni emrin në profilin tuaj para se të aplikoni.');
      return;
    }

    setIsSubmitting(true);
    try {
      await applyToMarketplaceJob({ jobId: job.id, coverLetter, experience }, user);
      toast.success('Aplikimi u dërgua me sukses!');
      onApplied(job.id);
      setOpen(false);
      setCoverLetter('');
      setExperience('');
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-md">Apliko</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Apliko për {job.title}</DialogTitle>
          <DialogDescription>
            {job.company} · {job.location}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="rounded-md bg-muted/50 border px-3 py-2 text-sm flex items-center gap-2">
            <span className="font-medium truncate">{user.name}</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground truncate">{user.email}</span>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`cover-${job.id}`}>
              Letra e motivimit{' '}
              <span className="text-muted-foreground font-normal text-xs">(opsionale)</span>
            </Label>
            <Textarea
              id={`cover-${job.id}`}
              placeholder="Pse jeni i/e interesuar për këtë pozicion?"
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              rows={4}
              maxLength={2000}
              disabled={isSubmitting}
            />
            <p className="text-xs text-right text-muted-foreground">{coverLetter.length}/2000</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`exp-${job.id}`}>
              Eksperienca relevante{' '}
              <span className="text-muted-foreground font-normal text-xs">(opsionale)</span>
            </Label>
            <Textarea
              id={`exp-${job.id}`}
              placeholder="Përshkruani shkurtimisht eksperiencën tuaj..."
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              rows={3}
              maxLength={1000}
              disabled={isSubmitting}
            />
            <p className="text-xs text-right text-muted-foreground">{experience.length}/1000</p>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isSubmitting}>
              Mbyll
            </Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Duke dërguar...
              </>
            ) : (
              'Dërgo aplikimin'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
