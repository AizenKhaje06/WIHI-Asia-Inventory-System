/**
 * Enterprise Form Field Group Component
 * Accessible form field with validation states
 */

import * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle2, Info } from "lucide-react"

export interface FormFieldGroupProps {
  label: string
  htmlFor: string
  children: React.ReactNode
  error?: string
  hint?: string
  required?: boolean
  optional?: boolean
  description?: string
  className?: string
}

export function FormFieldGroup({
  label,
  htmlFor,
  children,
  error,
  hint,
  required = false,
  optional = false,
  description,
  className,
}: FormFieldGroupProps) {
  const hasError = !!error
  const fieldId = htmlFor
  const descriptionId = description ? `${fieldId}-description` : undefined
  const errorId = error ? `${fieldId}-error` : undefined
  const hintId = hint ? `${fieldId}-hint` : undefined

  return (
    <div className={cn("space-y-2", className)}>
      {/* Label */}
      <div className="flex items-center justify-between">
        <Label 
          htmlFor={fieldId}
          className={cn(
            "text-sm font-medium",
            hasError && "text-red-600 dark:text-red-400"
          )}
        >
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-label="required">
              *
            </span>
          )}
          {optional && (
            <span className="text-slate-500 ml-1 text-xs font-normal">
              (optional)
            </span>
          )}
        </Label>
      </div>

      {/* Description */}
      {description && (
        <p 
          id={descriptionId}
          className="text-sm text-slate-600 dark:text-slate-400"
        >
          {description}
        </p>
      )}

      {/* Field */}
      <div className="relative">
        {React.cloneElement(children as React.ReactElement, {
          id: fieldId,
          'aria-describedby': [descriptionId, errorId, hintId]
            .filter(Boolean)
            .join(' ') || undefined,
          'aria-invalid': hasError,
          'aria-required': required,
          className: cn(
            (children as React.ReactElement).props.className,
            hasError && "border-red-500 focus:border-red-500 focus:ring-red-500/20"
          ),
        })}
      </div>

      {/* Error Message */}
      {error && (
        <div 
          id={errorId}
          className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400"
          role="alert"
          aria-live="polite"
        >
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Hint */}
      {hint && !error && (
        <div 
          id={hintId}
          className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400"
        >
          <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{hint}</span>
        </div>
      )}
    </div>
  )
}

/**
 * Success state field (for confirmations)
 */
export interface FormFieldSuccessProps {
  label: string
  message: string
  className?: string
}

export function FormFieldSuccess({
  label,
  message,
  className,
}: FormFieldSuccessProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-sm font-medium text-green-600 dark:text-green-400">
        {label}
      </Label>
      <div className="flex items-start gap-2 text-sm text-green-600 dark:text-green-400">
        <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <span>{message}</span>
      </div>
    </div>
  )
}

/**
 * Field group for inline fields (e.g., first name + last name)
 */
export interface FormFieldInlineGroupProps {
  children: React.ReactNode
  className?: string
}

export function FormFieldInlineGroup({
  children,
  className,
}: FormFieldInlineGroupProps) {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-4", className)}>
      {children}
    </div>
  )
}

/**
 * Section divider for form sections
 */
export interface FormSectionProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function FormSection({
  title,
  description,
  children,
  className,
}: FormSectionProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {description}
          </p>
        )}
      </div>
      <div className="space-y-6 pl-4 border-l-2 border-slate-200 dark:border-slate-700">
        {children}
      </div>
    </div>
  )
}
