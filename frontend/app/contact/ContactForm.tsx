"use client";
import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Send, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { submitContact } from "@/lib/api";
import { cn } from "@/lib/utils";

type FormState = "idle" | "loading" | "success" | "error";

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

function Field({ label, error, required, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-small font-medium text-text-primary">
        {label}
        {required && <span className="text-accent ml-0.5" aria-hidden="true">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs text-error flex items-center gap-1" role="alert">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  );
}

export default function ContactForm() {
  const shouldReduce = useReducedMotion();
  const [formState, setFormState] = useState<FormState>("idle");
  const [form, setForm] = useState<FormData>({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const validate = (): boolean => {
    const errs: Partial<FormData> = {};
    if (!form.name.trim()) errs.name = "Your name is required";
    if (!form.email.trim()) errs.email = "Your email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Enter a valid email address";
    if (!form.subject.trim()) errs.subject = "A subject helps me respond faster";
    if (!form.message.trim()) errs.message = "A message is required";
    else if (form.message.trim().length < 20) errs.message = "Please write at least 20 characters";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors((e) => ({ ...e, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setFormState("loading");
    try {
      await submitContact(form);
      setFormState("success");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      setFormState("error");
    }
  };

  const inputClass = (field: keyof FormData) =>
    cn(
      "w-full px-4 py-3 rounded-md bg-surface border text-text-primary text-small",
      "placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all duration-micro",
      errors[field] ? "border-error/50 focus:ring-error/30" : "border-border focus:border-accent/50"
    );

  if (formState === "success") {
    return (
      <motion.div
        initial={shouldReduce ? false : { opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center gap-4 py-20 text-center bg-surface border border-border rounded-xl"
      >
        <div className="w-14 h-14 rounded-full bg-success/10 border border-success/20 flex items-center justify-center">
          <CheckCircle size={28} className="text-success" />
        </div>
        <div>
          <h3 className="font-display font-bold text-subheading mb-2">Message sent!</h3>
          <p className="text-small text-text-secondary max-w-xs">
            Thanks for reaching out. I&apos;ll get back to you within 24 hours.
          </p>
        </div>
        <button
          onClick={() => setFormState("idle")}
          className="btn-ghost text-xs px-4 py-2"
        >
          Send another message
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="Name" error={errors.name} required>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Din Muhammad Rezwoan"
            autoComplete="name"
            className={inputClass("name")}
            disabled={formState === "loading"}
          />
        </Field>
        <Field label="Email" error={errors.email} required>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            autoComplete="email"
            className={inputClass("email")}
            disabled={formState === "loading"}
          />
        </Field>
      </div>

      <Field label="Subject" error={errors.subject} required>
        <input
          type="text"
          name="subject"
          value={form.subject}
          onChange={handleChange}
          placeholder="Project inquiry / Remote position / Collaboration"
          className={inputClass("subject")}
          disabled={formState === "loading"}
        />
      </Field>

      <Field label="Message" error={errors.message} required>
        <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          placeholder="Tell me about your project, timeline, and budget..."
          rows={6}
          className={cn(inputClass("message"), "resize-none")}
          disabled={formState === "loading"}
        />
      </Field>

      {formState === "error" && (
        <div className="flex items-center gap-2 text-small text-error p-3 rounded-md border border-error/20 bg-error/5" role="alert">
          <AlertCircle size={14} />
          <span>Something went wrong. Please try again or email me directly.</span>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={formState === "loading"}
        className={cn(
          "btn-accent w-full sm:w-auto justify-center",
          formState === "loading" && "opacity-70 cursor-not-allowed"
        )}
        aria-busy={formState === "loading"}
      >
        {formState === "loading" ? (
          <>
            <Loader2 size={15} className="animate-spin" />
            Sending…
          </>
        ) : (
          <>
            <Send size={15} />
            Send message
          </>
        )}
      </button>
    </div>
  );
}
