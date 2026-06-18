"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { TextPlugin } from "gsap/TextPlugin";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight02Icon } from "@hugeicons/core-free-icons";
import { AnimatedFooter } from "@/components/landing/AnimatedFooter";
import { SmokyRevealBackground } from "@/components/landing/SmokyRevealBackground";

gsap.registerPlugin(TextPlugin);

export function WaitlistPage() {
  const [email, setEmail] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [validationMessage, setValidationMessage] = useState("");
  const heroRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLParagraphElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const restoreFormTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!heroRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from("[data-gsap='nav']", { opacity: 0, y: -18, duration: 0.7, ease: "power3.out" });
      gsap.from("[data-gsap='hero-copy']", { y: 28, duration: 0.85, delay: 0.15, stagger: 0.1, ease: "power3.out" });
      gsap.from("[data-gsap='waitlist-form']", { y: 22, scale: 0.98, duration: 0.75, delay: 0.5, ease: "power3.out" });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    return () => {
      if (restoreFormTimer.current) window.clearTimeout(restoreFormTimer.current);
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (!normalizedEmail) { setValidationMessage("Masukkan email dulu."); animateValidationError(); return; }
    if (normalizedEmail.length > 254) { setValidationMessage("Email terlalu panjang."); animateValidationError(); return; }
    if (/\s/.test(normalizedEmail)) { setValidationMessage("Email tidak boleh memakai spasi."); animateValidationError(); return; }
    if (!emailPattern.test(normalizedEmail)) { setValidationMessage("Masukkan format email yang valid."); animateValidationError(); return; }

    let alreadyRegistered = false;
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      });
      if (!res.ok) { setValidationMessage("Gagal daftar, coba lagi."); animateValidationError(); return; }
      const data = await res.json();
      alreadyRegistered = !!data.alreadyRegistered;
    } catch {
      setValidationMessage("Gagal daftar, coba lagi.");
      animateValidationError();
      return;
    }

    setValidationMessage("");
    setSuccessMessage(alreadyRegistered ? "Email kamu sudah terdaftar di waitlist." : "Berhasil. Kamu sudah masuk waitlist.");
    setEmail("");
    if (restoreFormTimer.current) window.clearTimeout(restoreFormTimer.current);

    window.requestAnimationFrame(() => {
      if (successRef.current) {
        gsap.fromTo(successRef.current,
          { autoAlpha: 0, y: 12, filter: "blur(8px)" },
          { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.7, ease: "power3.out" }
        );
      }
      if (formRef.current) {
        gsap.fromTo(formRef.current, { scale: 0.98 }, { scale: 1, duration: 0.55, ease: "elastic.out(1, 0.62)" });
      }
    });

    restoreFormTimer.current = window.setTimeout(() => {
      if (successRef.current) {
        gsap.to(successRef.current, {
          autoAlpha: 0, y: -8, filter: "blur(8px)", duration: 0.32, ease: "power2.in",
          onComplete: () => setSuccessMessage(""),
        });
      } else {
        setSuccessMessage("");
      }
    }, 1800);
  }

  function animateValidationError() {
    if (!formRef.current) return;
    gsap.fromTo(formRef.current, { x: -4 }, { x: 0, duration: 0.42, ease: "elastic.out(1, 0.35)" });
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#ffffeb] text-white">
      <section
        ref={heroRef}
        className="hero-shell relative isolate min-h-[100svh] touch-none overflow-hidden bg-[linear-gradient(180deg,#599e81_0%,#03492c_100%)]"
        aria-labelledby="waitlist-title"
      >
        <div className="absolute -left-20 bottom-[24%] h-[161px] w-[159px] bg-white blur-[146px]" />
        <div className="absolute -right-20 bottom-[24.5%] h-[161px] w-[159px] bg-white blur-[146px]" />

        <SmokyRevealBackground />

        <header
          data-gsap="nav"
          className="fixed left-6 right-6 top-8 z-50 mx-auto flex max-w-[1280px] items-center justify-between md:left-20 md:right-20 md:top-12"
        >
          <a aria-label="Fratello home" href="#" className="block h-[28.5px] w-[39.25px]">
            <Image src="/logo-mark.svg" alt="" width={39} height={29} priority className="h-full w-full" />
          </a>
          <nav aria-label="Primary navigation" className="relative flex items-center">
            <Link
              href="/newsletter"
              className="block max-w-[calc(100vw-120px)] truncate rounded-full bg-gradient-to-b from-[#272727] to-[#292929] px-4 py-3 text-[16px] font-medium leading-none text-white transition hover:from-[#202020] hover:to-[#262626] focus:outline-none focus:ring-2 focus:ring-white/70"
            >
              Public Newsletter
            </Link>
          </nav>
        </header>

        <div className="absolute inset-0 z-10 flex items-center justify-center px-[30px] text-center">
          <div className="flex w-full max-w-[490px] flex-col items-center justify-center gap-10">
            <div className="flex w-full flex-col items-center justify-center gap-4">
              <p
                data-gsap="hero-copy"
                className="mx-auto rounded-full border border-white/20 bg-white/10 px-4 py-2 text-center text-[16px] font-normal leading-none tracking-normal text-[#effff8] shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_8px_28px_rgba(3,73,44,0.18)] backdrop-blur-xl"
              >
                COMING THIS JUNE
              </p>
              <h1
                id="waitlist-title"
                data-gsap="hero-copy"
                className="mx-auto w-full max-w-full text-center font-serif text-[clamp(58px,16.5vw,82px)] font-normal leading-[1.18] tracking-normal text-white md:text-[clamp(62px,11.1vw,160px)] md:leading-[1.28]"
              >
                Fratello
              </h1>
              <p
                data-gsap="hero-copy"
                className="mx-auto w-full max-w-[427px] text-center text-[18px] font-normal leading-[1.2] tracking-normal text-white md:text-[24px]"
              >
                Bikin brand kamu direkomendasiin sama AI, dipilih sama manusia.
              </p>
            </div>

            <div data-gsap="waitlist-form" className="relative mx-auto w-full">
              <form
                ref={formRef}
                id="join-waitlist"
                onSubmit={handleSubmit}
                noValidate
                aria-describedby={validationMessage ? "email-validation" : undefined}
                className="waitlist-form relative mx-auto flex w-full items-center gap-4 rounded-full bg-[#252525]/15 p-2 shadow-[inset_0px_8px_23.2px_0px_rgba(0,0,0,0.05),inset_0px_-8px_40px_0px_rgba(0,0,0,0.05)]"
              >
                {successMessage ? (
                  <p
                    ref={successRef}
                    role="status"
                    className="flex min-h-12 w-full items-center justify-center px-4 text-center text-[16px] font-medium leading-[1.25] tracking-normal text-white"
                  >
                    {successMessage}
                  </p>
                ) : (
                  <>
                    <label className="sr-only" htmlFor="email">Masukkan email anda</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      required
                      minLength={6}
                      maxLength={254}
                      pattern="^[^\s@]+@[^\s@]+\.[^\s@]{2,}$"
                      title="Masukkan email yang valid, contoh nama@email.com"
                      aria-invalid={validationMessage ? "true" : "false"}
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setSuccessMessage(""); setValidationMessage(""); }}
                      placeholder="Masukkan email anda"
                      className="min-w-0 flex-1 rounded bg-transparent px-4 py-2 text-left text-[16px] font-normal leading-normal text-white outline-none placeholder:text-[#b9b9b9]"
                    />
                    <button
                      ref={submitButtonRef}
                      type="submit"
                      aria-label="Join waitlist"
                      className="group/submit flex h-12 min-w-[166px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-white px-4 text-[16px] font-medium leading-none text-[#03492c] focus:outline-none focus:ring-2 focus:ring-white/70"
                    >
                      <span className="translate-x-3 transform-gpu transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform group-hover/submit:translate-x-0 group-focus-visible/submit:translate-x-0">
                        Join Waitlist
                      </span>
                      <span
                        aria-hidden="true"
                        className="ml-2 flex w-6 translate-x-[-8px] scale-95 transform-gpu items-center justify-center opacity-0 transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform group-hover/submit:translate-x-0 group-hover/submit:scale-100 group-hover/submit:opacity-100 group-focus-visible/submit:translate-x-0 group-focus-visible/submit:scale-100 group-focus-visible/submit:opacity-100"
                      >
                        <HugeiconsIcon icon={ArrowRight02Icon} size={22} color="currentColor" strokeWidth={2} />
                      </span>
                    </button>
                  </>
                )}
              </form>
              {validationMessage ? (
                <p
                  id="email-validation"
                  role="alert"
                  className="absolute left-1/2 top-[calc(100%+14px)] w-full -translate-x-1/2 text-center text-[16px] font-medium leading-[1.25] tracking-normal text-white"
                >
                  {validationMessage}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <AnimatedFooter />
    </main>
  );
}
