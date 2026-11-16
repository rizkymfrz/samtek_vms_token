import { KeyRoundIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

export const ForgotPasswordDialog = () => {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="link"
            className="h-auto p-0 text-muted-foreground hover:text-foreground"
          />
        }
      >
        Forgot password?
      </DialogTrigger>
      <DialogContent>
        <DialogHeader icon={KeyRoundIcon}>
          <DialogTitle>Forgot your password?</DialogTitle>
        </DialogHeader>
        <Separator />
        <DialogBody>
          <DialogDescription>
            Passwords are managed by your administrator. Contact them to have
            your password reset.
          </DialogDescription>
        </DialogBody>
        <Separator />
        <DialogFooter>
          <DialogClose render={<Button variant="secondary" />}>
            Close
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
