"use client";

import { useState } from "react";
import { buttonPrimaryClass, buttonSecondaryClass } from "./form-styles";

type Step = {
  id: string;
  title: string;
  description?: string;
  isValid?: boolean;
};

type WizardProps = {
  steps: Step[];
  currentStepIndex: number;
  onStepChange: (index: number) => void;
  onFinish: () => void;
  onCancel: () => void;
  children: React.ReactNode;
};

export function Wizard({
  steps,
  currentStepIndex,
  onStepChange,
  onFinish,
  onCancel,
  children,
}: WizardProps) {
  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;
  const isFirstStep = currentStepIndex === 0;

  return (
    <div className="flex flex-col gap-6 rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      {/* Header / Steps Indicator */}
      <div className="border-b border-zinc-200 bg-zinc-50/50 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900/30">
        <nav aria-label="Progresso" className="flex items-center justify-between">
          <ol className="flex w-full items-center gap-4">
            {steps.map((step, index) => {
              const isActive = index === currentStepIndex;
              const isDone = index < currentStepIndex;
              return (
                <li key={step.id} className="flex flex-1 items-center gap-3">
                  <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                      isActive
                        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                        : isDone
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                          : "bg-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500"
                    }`}
                  >
                    {isDone ? "✓" : index + 1}
                  </div>
                  <div className="hidden flex-col sm:flex">
                    <p
                      className={`text-[11px] font-bold uppercase tracking-wider ${
                        isActive
                          ? "text-zinc-900 dark:text-zinc-100"
                          : "text-zinc-400"
                      }`}
                    >
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="h-[1px] flex-1 bg-zinc-200 dark:bg-zinc-800" />
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>

      {/* Content */}
      <div className="px-6 py-2">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            {currentStep.title}
          </h3>
          {currentStep.description && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {currentStep.description}
            </p>
          )}
        </div>
        {children}
      </div>

      {/* Footer / Actions */}
      <div className="flex justify-between border-t border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <button
          type="button"
          onClick={onCancel}
          className={buttonSecondaryClass}
        >
          Cancelar
        </button>
        <div className="flex gap-2">
          {!isFirstStep && (
            <button
              type="button"
              onClick={() => onStepChange(currentStepIndex - 1)}
              className={buttonSecondaryClass}
            >
              Anterior
            </button>
          )}
          {isLastStep ? (
            <button
              type="button"
              onClick={onFinish}
              disabled={currentStep.isValid === false}
              className={buttonPrimaryClass}
            >
              Finalizar
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onStepChange(currentStepIndex + 1)}
              disabled={currentStep.isValid === false}
              className={buttonPrimaryClass}
            >
              Próximo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
