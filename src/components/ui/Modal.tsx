'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAnimations } from '@/hooks/useAnimations';

export interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  fullScreenOnMobile?: boolean;
  fullScreen?: boolean;
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2, ease: 'easeOut' as const } },
  exit: { opacity: 0, transition: { duration: 0.15, ease: 'easeIn' as const } },
};

const contentVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1, scale: 1, y: 0,
    transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] as const },
  },
  exit: {
    opacity: 0, scale: 0.95, y: 10,
    transition: { duration: 0.2, ease: [0.4, 0, 1, 1] as const },
  },
};

export function Modal({ open, onOpenChange, title, description, children, className, fullScreenOnMobile = false, fullScreen = false }: ModalProps) {
  const shouldAnimate = useAnimations();

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                variants={shouldAnimate ? overlayVariants : undefined}
                initial={shouldAnimate ? "hidden" : false}
                animate="visible"
                exit={shouldAnimate ? "exit" : undefined}
                transition={shouldAnimate ? undefined : { duration: 0 }}
                className="fixed inset-0 bg-black/85 z-40"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount aria-describedby={description ? undefined : undefined}>
              <motion.div
                variants={shouldAnimate ? contentVariants : undefined}
                initial={shouldAnimate ? "hidden" : false}
                animate="visible"
                exit={shouldAnimate ? "exit" : undefined}
                transition={shouldAnimate ? undefined : { duration: 0 }}
                className={cn(
                  'fixed z-50 bg-[#2c3e50] border-2 border-white rounded-[10px] text-white shadow-[0_0_50px_rgba(0,0,0,0.8)] focus:outline-none',
                  fullScreen
                    ? 'inset-0 rounded-none'
                    : fullScreenOnMobile
                    ? 'inset-0 rounded-none tablet:left-1/2 tablet:top-1/2 tablet:-translate-x-1/2 tablet:-translate-y-1/2 tablet:rounded-[10px] tablet:w-[90vw] tablet:max-w-[800px] tablet:max-h-[85vh] tablet:inset-auto'
                    : 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[800px] max-h-[85vh]',
                  'overflow-y-auto p-[30px]',
                  className
                )}
              >
                {title && (
                  <Dialog.Title className="font-[Oswald,sans-serif] text-[#f1c40f] text-2xl uppercase mb-2">
                    {title}
                  </Dialog.Title>
                )}
                {description && (
                  <Dialog.Description className="text-sm text-gray-300 mb-4">
                    {description}
                  </Dialog.Description>
                )}
                <div>{children}</div>
                <Dialog.Close
                  className="absolute top-2.5 right-2.5 w-10 h-10 bg-[#c0392b] text-white border-none rounded-[5px] text-xl flex items-center justify-center cursor-pointer hover:bg-[#e74c3c] transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                  aria-label="Đóng"
                >
                  ✕
                </Dialog.Close>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
