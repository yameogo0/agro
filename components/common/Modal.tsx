"use client"

import { Fragment, ReactNode } from "react"
import { Dialog, Transition } from "@headlessui/react"
import { X } from "lucide-react"
import { Button } from "./Button"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: "sm" | "md" | "lg" | "xl" | "full"
  showCloseButton?: boolean
  footer?: ReactNode
}

export function Modal({ isOpen, onClose, title, children, size = "md", showCloseButton = true, footer }: ModalProps) {
  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-[90vw] max-h-[90vh]",
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className={`w-full ${sizes[size]} transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all`}>
                {title && (
                  <Dialog.Title className="text-xl font-semibold text-gray-900 mb-4 flex items-center justify-between">
                    <span>{title}</span>
                    {showCloseButton && (
                      <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </Dialog.Title>
                )}
                {!title && showCloseButton && (
                  <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
                    <X className="h-5 w-5" />
                  </button>
                )}
                <div className="mt-2">{children}</div>
                {footer && <div className="mt-6">{footer}</div>}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}