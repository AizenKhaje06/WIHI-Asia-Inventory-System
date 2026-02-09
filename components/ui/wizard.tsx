"use client"

import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/ui/loading-states"

export interface WizardStep {
  id: string
  title: string
  description?: string
  content: React.ReactNode
  validate?: () => boolean | Promise<boolean>
}

interface WizardProps {
  steps: WizardStep[]
  onComplete: () => void | Promise<void>
  onCancel?: () => void
  currentStep?: number
  onStepChange?: (step: number) => void
  showProgress?: boolean
}

export function Wizard({
  steps,
  onComplete,
  onCancel,
  currentStep: controlledStep,
  onStepChange,
  showProgress = true,
}: WizardProps) {
  const [internalStep, setInternalStep] = React.useState(0)
  const [completedSteps, setCompletedSteps] = React.useState<Set<number>>(new Set())
  const [isValidating, setIsValidating] = React.useState(false)

  const currentStep = controlledStep ?? internalStep
  const isControlled = controlledStep !== undefined

  const activeStep = steps[currentStep]
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === steps.length - 1
  const progress = ((currentStep + 1) / steps.length) * 100

  const goToStep = (step: number) => {
    if (isControlled && onStepChange) {
      onStepChange(step)
    } else {
      setInternalStep(step)
    }
  }

  const goToNextStep = async () => {
    if (activeStep.validate) {
      setIsValidating(true)
      try {
        const isValid = await activeStep.validate()
        if (!isValid) {
          setIsValidating(false)
          return
        }
      } catch (error) {
        console.error('Validation error:', error)
        setIsValidating(false)
        return
      }
      setIsValidating(false)
    }

    setCompletedSteps((prev) => new Set(prev).add(currentStep))

    if (isLastStep) {
      await onComplete()
    } else {
      goToStep(currentStep + 1)
    }
  }

  const goToPreviousStep = () => {
    if (!isFirstStep) {
      goToStep(currentStep - 1)
    }
  }

  return (
    <div className="w-full space-y-8">
      {/* Progress Bar */}
      {showProgress && (
        <div className="space-y-2">
          <ProgressBar 
            progress={progress} 
            label={`Step ${currentStep + 1} of ${steps.length}`}
            showPercentage={false}
          />
        </div>
      )}

      {/* Step Indicators */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = index === currentStep
          const isCompleted = completedSteps.has(index)
          const isAccessible = index <= currentStep

          return (
            <React.Fragment key={step.id}>
              <button
                onClick={() => isAccessible && goToStep(index)}
                disabled={!isAccessible}
                className={cn(
                  "flex flex-col items-center gap-2 transition-all",
                  isAccessible ? "cursor-pointer" : "cursor-not-allowed opacity-50"
                )}
                aria-current={isActive ? "step" : undefined}
              >
                {/* Step Circle */}
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all",
                    isActive &&
                      "border-orange-500 bg-orange-500 text-white shadow-lg shadow-orange-500/30",
                    isCompleted &&
                      !isActive &&
                      "border-green-500 bg-green-500 text-white",
                    !isActive &&
                      !isCompleted &&
                      "border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-800"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-semibold">{index + 1}</span>
                  )}
                </div>

                {/* Step Label */}
                <div className="flex flex-col items-center gap-1">
                  <span
                    className={cn(
                      "text-sm font-medium transition-colors",
                      isActive && "text-orange-600 dark:text-orange-400",
                      !isActive && "text-slate-600 dark:text-slate-400"
                    )}
                  >
                    {step.title}
                  </span>
                  {step.description && (
                    <span className="text-xs text-slate-500 dark:text-slate-500 max-w-[100px] text-center">
                      {step.description}
                    </span>
                  )}
                </div>
              </button>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 flex-1 transition-all mx-2",
                    isCompleted
                      ? "bg-green-500"
                      : "bg-slate-300 dark:bg-slate-700"
                  )}
                  aria-hidden="true"
                />
              )}
            </React.Fragment>
          )
        })}
      </div>

      {/* Step Content */}
      <div className="rounded-[5px] border bg-card p-8 min-h-[300px]">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              {activeStep.title}
            </h2>
            {activeStep.description && (
              <p className="text-slate-600 dark:text-slate-400">
                {activeStep.description}
              </p>
            )}
          </div>

          <div className="pt-4">{activeStep.content}</div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <div>
          {onCancel && (
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!isFirstStep && (
            <Button
              type="button"
              variant="outline"
              onClick={goToPreviousStep}
              disabled={isValidating}
            >
              Previous
            </Button>
          )}
          
          <Button
            type="button"
            onClick={goToNextStep}
            disabled={isValidating}
            className="min-w-[100px]"
          >
            {isValidating ? (
              "Validating..."
            ) : isLastStep ? (
              "Complete"
            ) : (
              "Next"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

/**
 * Hook for managing wizard state externally
 */
export function useWizard(initialStep = 0) {
  const [currentStep, setCurrentStep] = React.useState(initialStep)
  const [completedSteps, setCompletedSteps] = React.useState<Set<number>>(new Set())

  const goToStep = React.useCallback((step: number) => {
    setCurrentStep(step)
  }, [])

  const nextStep = React.useCallback(() => {
    setCompletedSteps((prev) => new Set(prev).add(currentStep))
    setCurrentStep((prev) => prev + 1)
  }, [currentStep])

  const previousStep = React.useCallback(() => {
    setCurrentStep((prev) => Math.max(0, prev - 1))
  }, [])

  const reset = React.useCallback(() => {
    setCurrentStep(initialStep)
    setCompletedSteps(new Set())
  }, [initialStep])

  return {
    currentStep,
    completedSteps,
    goToStep,
    nextStep,
    previousStep,
    reset,
  }
}
