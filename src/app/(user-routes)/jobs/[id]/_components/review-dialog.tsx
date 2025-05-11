"use client"
import { useState } from "react"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

// Match the interface expected by the parent component's onSubmit *parameter*
export interface ReviewData {
  rating: number
  comment: string
  jobId?: string // jobId is optional as the dialog doesn't have it directly
}

interface ReviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  caregiverName: string
  onSubmit: (reviewData: ReviewData) => Promise<void> // This expects the local ReviewData type
}

export default function ReviewDialog({
  open,
  onOpenChange,
  caregiverName,
  onSubmit
}: ReviewDialogProps) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState("")

  const handleSubmit = async () => {
    if (rating === 0) {
      // Optionally show a toast or error message if rating is required
      return
    }
    await onSubmit({
      rating,
      comment,
      // Note: Parent component will add other necessary fields like jobId and caregiverId
      // We pass jobId as undefined or omit it, matching the interface
      jobId: undefined, // Explicitly pass as undefined or just omit it
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Review {caregiverName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <h3 className="text-sm font-medium mb-2">How would you rate your experience?</h3>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="focus:outline-none"
                >
                  <Star
                    size={32}
                    className={`${
                      star <= (hoverRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {rating > 0 ? `${rating} star${rating > 1 ? "s" : ""}` : "Select a rating"}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2">Comments (optional)</h3>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[100px]"
              placeholder="Share your experience..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={rating === 0}>
            Submit Review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}