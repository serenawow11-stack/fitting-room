// Adapted from shadcn/ui (MIT): https://ui.shadcn.com/docs/components/dialog
import * as React from 'react';
import * as Primitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
export const Dialog = Primitive.Root;
export const DialogTitle = Primitive.Title;
export const DialogDescription = Primitive.Description;
export const DialogContent = React.forwardRef<React.ElementRef<typeof Primitive.Content>, React.ComponentPropsWithoutRef<typeof Primitive.Content>>(({ className, children, ...props }, ref) => <Primitive.Portal><Primitive.Overlay className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" /><Primitive.Content ref={ref} className={cn('dialog-content fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-input bg-background p-6 shadow-2xl max-h-[90dvh] overflow-y-auto', className)} {...props}>{children}<Primitive.Close className="absolute right-3 top-3 rounded-md p-2 hover:bg-accent focus-visible:ring-2" aria-label="关闭"><X size={18} /></Primitive.Close></Primitive.Content></Primitive.Portal>);
DialogContent.displayName = 'DialogContent';
