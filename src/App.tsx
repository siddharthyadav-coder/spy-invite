import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "./lib/supabase";

export default function App() {
  const [opened, setOpened] = useState(false);
  const [mode, setMode] = useState<"idle" | "name" | "breach" | "error">("idle");
  const [name, setName] = useState("");
  const [countdown, setCountdown] = useState(5);
  const [showReset, setShowReset] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBreakSeal, setShowBreakSeal] = useState(false);

  const invite = useMemo(
    () => ({
      title: "MISSION ASSIGNMENT",
      intro: "You have been selected for a high-priority assignment.",
      body: "Your mission, should you choose to accept it, is to report to [PARTY NAME] on [DATE] at [TIME]. The operation will take place at [LOCATION]. Attendance is expected to be sharp, discreet, and fully committed to the objective.",
      operation: "[PARTY NAME / THEME]",
      date: "[DATE]",
      time: "[TIME]",
      location: "[LOCATION]",
      dressCode: "[DRESS CODE]",
      plusOne: "[NAME]",
      closing: "Commit these details to memory. As always, this file will self-destruct.",
    }),
    []
  );

  useEffect(() => {
    if (!opened && mode === "idle") {
      setShowBreakSeal(false);

      const buttonTimer = setTimeout(() => {
        setShowBreakSeal(true);
      }, 2000);

      return () => {
        clearTimeout(buttonTimer);
      };
    }
  }, [opened, mode]);

  useEffect(() => {
    if (mode !== "breach") return;
    if (countdown <= 0) {
      setMode("error");
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [mode, countdown]);

  useEffect(() => {
    if (mode !== "error") return;
    setShowReset(false);
    const timer = setTimeout(() => {
      setShowReset(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [mode]);

  const saveRsvp = async (guestName: string, response: "accept" | "decline") => {
    const { error } = await supabase.from("rsvps").insert([
      {
        name: guestName,
        response,
      },
    ]);

    if (error) {
      console.error("RSVP save failed:", error.message);
      return false;
    }

    return true;
  };

  const startDestruct = () => {
    setMode("breach");
    setCountdown(5);
    setShowReset(false);
    setIsSubmitting(false);
  };

  const resetFlow = () => {
    setOpened(false);
    setMode("idle");
    setName("");
    setCountdown(5);
    setShowReset(false);
    setIsSubmitting(false);
    setShowBreakSeal(false);
  };

  const handleAccept = () => {
    setMode("name");
  };

  const handleAcceptSubmit = async () => {
    if (!name.trim() || isSubmitting) return;
    setIsSubmitting(true);
    const ok = await saveRsvp(name.trim(), "accept");
    if (ok) {
      startDestruct();
      return;
    }
    setIsSubmitting(false);
  };

  const handleDecline = () => {
    startDestruct();
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505] text-neutral-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.08),transparent_38%)]" />

      <AnimatePresence>
        {mode === "breach" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black"
          >
            <div className="flex min-h-screen flex-col items-center justify-center px-6 pt-24 sm:pt-28 md:pt-32 text-center">
              <p className="text-red-500 text-xs sm:text-sm uppercase tracking-[0.45em] sm:tracking-[0.5em]">
                Security Breached
              </p>
              <h2 className="mt-4 sm:mt-5 text-3xl sm:text-4xl md:text-6xl font-semibold tracking-[0.12em] sm:tracking-[0.16em] text-white">
                FILE DESTRUCTION
              </h2>
              <p className="mt-5 sm:mt-6 text-base sm:text-lg md:text-2xl text-red-300 font-mono">
                File destruction in {countdown}
              </p>
            </div>
          </motion.div>
        )}

        {mode === "error" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-0 z-50 overflow-hidden bg-black"
          >
            <div className="absolute inset-0 flex flex-col justify-around overflow-hidden opacity-20">
              {Array.from({ length: 13 }).map((_, row) => (
                <div
                  key={row}
                  className="whitespace-nowrap text-red-700 text-[10px] sm:text-[11px] md:text-sm font-semibold tracking-[0.26em] sm:tracking-[0.32em]"
                >
                  {Array.from({ length: 16 }).map((_, col) => (
                    <span key={col} className="mr-5 sm:mr-8 inline-block">
                      ERROR
                    </span>
                  ))}
                </div>
              ))}
            </div>

            <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 pt-24 sm:pt-28 md:pt-32 text-center">
              <p className="text-red-500 text-xs sm:text-sm uppercase tracking-[0.45em] sm:tracking-[0.5em]">
                System Failure
              </p>
              <h2 className="mt-4 text-3xl sm:text-4xl md:text-6xl font-semibold tracking-[0.15em] sm:tracking-[0.2em] text-white">
                ERROR
              </h2>
              {showReset && (
                <button
                  onClick={resetFlow}
                  className="pointer-events-auto mt-8 sm:mt-10 rounded-full border border-red-500/40 px-5 sm:px-6 py-3 text-xs sm:text-sm uppercase tracking-[0.25em] sm:tracking-[0.3em] text-red-200 transition hover:bg-red-500/10"
                >
                  Reset File
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="relative z-10 flex min-h-screen items-center justify-center px-4 sm:px-6 py-10 sm:py-16">
        <div className="w-full max-w-5xl">
          <AnimatePresence mode="wait">
            {!opened ? (
              <motion.div
                key="dossier"
                initial={{ opacity: 0, y: 20, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -18 }}
                transition={{ duration: 0.45 }}
                className="mx-auto max-w-3xl"
              >
                <div className="relative rounded-[1.75rem] md:rounded-[2.25rem] border border-[#8f722a] bg-[linear-gradient(180deg,#101010_0%,#050505_100%)] px-5 sm:px-8 md:px-10 pt-16 sm:pt-20 md:pt-24 pb-10 sm:pb-12 md:pb-16 shadow-[0_30px_80px_rgba(0,0,0,0.6)] overflow-hidden min-h-[22rem] sm:min-h-[26rem] md:min-h-[30rem]">
                  <div className="absolute inset-x-0 top-0 h-36 sm:h-44 md:h-48 bg-[linear-gradient(180deg,#171717_0%,#0a0a0a_100%)]" />
                  <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[92%] sm:w-[90%] md:w-[88%] h-40 sm:h-52 md:h-64 bg-[linear-gradient(180deg,#1d1d1d_0%,#0f0f0f_100%)] [clip-path:polygon(0_0,100%_0,50%_100%)] border-x border-b border-[#8f722a] shadow-[0_12px_22px_rgba(0,0,0,0.3)]" />

                  <div className="relative z-10 flex flex-col items-center justify-center pt-14 sm:pt-20 md:pt-24">
                    <div className="relative mt-2 sm:mt-4 md:mt-6 flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full border border-[#a8832b] bg-[radial-gradient(circle_at_35%_30%,#f1da8d_0%,#d7b14f_26%,#b88a22_58%,#7a5811_100%)] shadow-[inset_0_4px_10px_rgba(255,255,255,0.18),inset_0_-8px_18px_rgba(0,0,0,0.35),0_10px_18px_rgba(0,0,0,0.45)]">
                      <div className="absolute inset-[9px] rounded-full border border-white/10" />
                    </div>

                    <AnimatePresence>
                      {showBreakSeal && (
                        <motion.button
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.5 }}
                          onClick={() => setOpened(true)}
                          className="mt-8 sm:mt-10 rounded-full bg-[#c9a44c] px-6 sm:px-8 py-3 sm:py-4 text-xs sm:text-sm uppercase tracking-[0.28em] sm:tracking-[0.35em] text-black transition hover:bg-[#ddb969]"
                        >
                          Break Seal
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="invite"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                transition={{ duration: 0.45 }}
                className="mx-auto max-w-3xl rounded-[1.75rem] md:rounded-[2rem] border border-[#8f722a] bg-[linear-gradient(180deg,#111111_0%,#050505_100%)] p-3 sm:p-4 shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
              >
                <div className="rounded-[1.25rem] sm:rounded-[1.5rem] bg-[linear-gradient(180deg,#101010_0%,#070707_100%)] p-5 sm:p-8 md:p-10 text-[#e7cf8f] shadow-inner border border-[#7d6526]">
                  <div className="mx-auto max-w-2xl font-serif">
                    <p className="text-center text-[10px] sm:text-[11px] uppercase tracking-[0.28em] sm:tracking-[0.38em] text-[#b89b55]">
                      Classified Mission Brief
                    </p>
                    <h2 className="mt-4 text-center text-2xl sm:text-3xl md:text-4xl tracking-[0.08em] text-[#f1dc9b]">
                      {invite.title}
                    </h2>

                    <div className="mx-auto mt-6 sm:mt-8 h-px w-24 sm:w-32 bg-[#8f722a]" />

                    <div className="mt-6 sm:mt-8 space-y-4 sm:space-y-5 text-base sm:text-[18px] leading-7 sm:leading-8 text-[#e4c97e]">
                      <p className="text-lg sm:text-[19px] leading-8 sm:leading-9 text-[#f0d891]">
                        {invite.intro}
                      </p>
                      <p>{invite.body}</p>
                    </div>

                    <div className="mt-8 sm:mt-10 space-y-3 text-base sm:text-[18px] leading-7 sm:leading-8 text-[#e4c97e]">
                      <p className="uppercase tracking-[0.16em] sm:tracking-[0.2em] text-[#b89b55] text-xs sm:text-sm">
                        Mission Parameters
                      </p>
                      <p><span className="italic text-[#b89b55]">Operation:</span> {invite.operation}</p>
                      <p><span className="italic text-[#b89b55]">Date:</span> {invite.date}</p>
                      <p><span className="italic text-[#b89b55]">Time:</span> {invite.time}</p>
                      <p><span className="italic text-[#b89b55]">Location:</span> {invite.location}</p>
                      <p><span className="italic text-[#b89b55]">Dress Code:</span> {invite.dressCode}</p>
                      <p>BYOB</p>
                    </div>

                    <p className="mt-6 sm:mt-8 text-base sm:text-[18px] leading-7 sm:leading-8 text-[#e4c97e]">
                      If you would like to bring another agent (+1), text{" "}
                      <span className="text-[#f1dc9b]">{invite.plusOne}</span>.
                    </p>

                    <p className="mt-6 sm:mt-8 text-base sm:text-[18px] leading-7 sm:leading-8 text-[#f0d891]">
                      {invite.closing}
                    </p>

                    <AnimatePresence mode="wait">
                      {mode === "idle" && (
                        <motion.div
                          key="actions"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.25 }}
                          className="mt-8 sm:mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4"
                        >
                          <button
                            onClick={handleAccept}
                            className="rounded-full border border-[#a8832b] px-6 py-3 text-xs sm:text-sm uppercase tracking-[0.25em] sm:tracking-[0.3em] text-[#f1dc9b] transition hover:bg-[#a8832b] hover:text-black"
                          >
                            Accept
                          </button>
                          <button
                            onClick={handleDecline}
                            className="rounded-full border border-[#a8832b] px-6 py-3 text-xs sm:text-sm uppercase tracking-[0.25em] sm:tracking-[0.3em] text-[#f1dc9b] transition hover:bg-[#a8832b] hover:text-black"
                          >
                            Decline
                          </button>
                        </motion.div>
                      )}

                      {mode === "name" && (
                        <motion.div
                          key="name"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.28 }}
                          className="mt-8 sm:mt-10"
                        >
                          <p className="mb-4 text-xs sm:text-sm uppercase tracking-[0.22em] sm:tracking-[0.25em] text-[#b89b55]">
                            Enter your name
                          </p>
                          <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Type your name"
                            className="w-full rounded-xl border border-[#8f722a] bg-black px-4 py-3 text-base sm:text-lg text-[#f1dc9b] outline-none placeholder:text-[#7d6526] focus:border-[#c9a44c]"
                          />
                          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button
                              onClick={handleAcceptSubmit}
                              disabled={isSubmitting}
                              className="rounded-full border border-[#a8832b] px-6 py-3 text-xs sm:text-sm uppercase tracking-[0.25em] sm:tracking-[0.3em] text-[#f1dc9b] transition hover:bg-[#a8832b] hover:text-black disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {isSubmitting ? "Submitting" : "Confirm Accept"}
                            </button>
                            <button
                              onClick={() => {
                                setMode("idle");
                                setName("");
                              }}
                              className="rounded-full border border-[#a8832b] px-6 py-3 text-xs sm:text-sm uppercase tracking-[0.25em] sm:tracking-[0.3em] text-[#f1dc9b] transition hover:bg-[#a8832b] hover:text-black"
                            >
                              Back
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
