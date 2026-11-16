"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import {
  Search,
  Landmark,
  ChevronRight,
  ShieldCheck,
  X,
  Loader2,
  Building2,
} from "lucide-react";
import { toast } from "sonner";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import OtpInput from "@/components/auth/OtpInput";
import { Button, PhoneField, SubmitButton } from "@/components/forms";
import { useAuthStore } from "@/lib/store/authStore";
import BankLogo from "@/components/banks/BankLogo";
import { useBanks } from "@/lib/queries/useBanks";
import type { Bank } from "@/lib/api/banks";
import {
  bankStatus,
  bankWebsite,
  channelLabels,
} from "@/lib/banks/bankDisplay";

/** "All", then one tab per status the API returns (e.g. "Online"). */
type FilterTab = string;

const phoneStepSchema = Yup.object({
  phone: Yup.string()
    .trim()
    .required("Enter your phone number.")
    .test(
      "digits",
      "Enter a valid phone number.",
      (v = "") => v.replace(/\D/g, "").length >= 10,
    ),
});

export default function BankingPage() {
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("All");
  const { data: banks = [], isLoading, isError, refetch } = useBanks();
  const tabs = useMemo<FilterTab[]>(
    () => ["All", ...new Set(banks.map((b) => bankStatus(b).label))],
    [banks],
  );

  // Redirection Modal State
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [modalStep, setModalStep] = useState<"phone" | "otp" | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("+234 904 637 3748");
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpError, setOtpError] = useState(false);

  // Filter banks
  const filteredBanks = useMemo(() => {
    return banks.filter((bank) => {
      // Tab filter
      if (activeTab !== "All" && bankStatus(bank).label !== activeTab) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        return (
          bank.name.toLowerCase().includes(query) ||
          channelLabels(bank).join(" ").toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [banks, activeTab, searchQuery]);

  // Open modal step 1
  const handleBankClick = (bank: Bank) => {
    setSelectedBank(bank);
    setModalStep("phone");
    setOtp("");
    setOtpError(false);
  };

  // Close modal
  const handleCloseModal = () => {
    setSelectedBank(null);
    setModalStep(null);
    setOtp("");
    setOtpError(false);
    setIsVerifying(false);
  };

  // Handle step 1 continue
  const handleContinueToOtp = ({ phone }: { phone: string }) => {
    const value = phone.trim();
    setPhoneNumber(value);
    setModalStep("otp");
    toast.success(`OTP code sent to ${value}`);
  };

  // Handle step 2 verify & redirect
  const handleVerifyOtp = () => {
    if (!otp || otp.length < 4) {
      setOtpError(true);
      toast.error("Please enter the 6-digit verification code");
      return;
    }

    setIsVerifying(true);
    setOtpError(false);

    setTimeout(() => {
      setIsVerifying(false);
      if (selectedBank) {
        toast.success(`Verified! Opening ${selectedBank.name}...`);
        window.open(bankWebsite(selectedBank), "_blank", "noopener,noreferrer");
      }
      handleCloseModal();
    }, 800);
  };

  // Status badge: nothing for online banks, amber/red otherwise
  const renderBadge = (bank: Bank) => {
    const status = bankStatus(bank);
    if (status.tone === "online") return null;
    return (
      <span
        className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${status.tone === "warning" ? "bg-[#FEF6E6] text-[#B7791F]" : "bg-red-50 text-red-700"}`}
      >
        {status.label}
      </span>
    );
  };

  return (
    <div className="min-h-full bg-[#FFFAF7] space-y-6">
      {/* Top Header */}
      <section className="border-b border-[#F0E9E5] px-5 py-7 sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#E95312]">
          Banking
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[#20232A] sm:text-3xl">
          Your bank is <span className="text-[#FF6500]">one tap away.</span>
        </h2>
        <p className="mt-2 text-sm text-[#777486] sm:text-base">
          Visit your bank&apos;s secure digital banking service. Hatiso never
          sees or stores your login details.
        </p>
      </section>

      {/* Security Handoff Cyan Banner */}
      <section className="px-5 sm:px-8 space-y-6">
        <div className="flex items-center gap-3 rounded-xl border border-[#CFE8EC] bg-[#EAF6F8] px-4 py-3 text-xs sm:text-sm text-[#1B3C4A]">
          <Landmark className="h-5 w-5 shrink-0 text-[#147D8F]" />
          <span>
            A secure handoff, every time. You&apos;ll always see where
            you&apos;re going before leaving Hatiso.
          </span>
        </div>
        {/* Search and Filter Tabs */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Search Input */}
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A09D9B]" />
            <input
              type="text"
              placeholder="Search services or provider"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-[#E8E3DF] bg-white py-2.5 pl-10 pr-4 text-sm text-[#1B3C4A] placeholder:text-[#A09D9B] focus:border-[#E95312] focus:outline-none"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {tabs.map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-full px-4 py-2 text-xs sm:text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[#1B3C4A] text-white"
                      : "border border-[#E8E3DF] bg-white text-[#524E4E] hover:bg-[#F9F7F5]"
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section Subheader */}
      <section className="px-5 py-7 space-y-6 sm:px-8">
        <div>
          <p className="text-sm font-medium text-[#656160]">
            Where would you like to bank today?
          </p>
        </div>

        {/* Bank Cards Grid */}
        {isLoading ? (
          <div
            aria-busy="true"
            className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
          >
            {Array.from({ length: 3 }, (_, i) => (
              <div
                key={i}
                className="h-[84px] animate-pulse rounded-2xl border border-[#EDE8E4] bg-white"
              />
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-dashed border-[#DDD7D2] bg-white p-12 text-center">
            <Building2 className="mx-auto h-10 w-10 text-[#C4C0BE]" />
            <h3 className="mt-3 text-base font-semibold text-[#1B3C4A]">
              We couldn&apos;t load the banks
            </h3>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-3 text-sm font-semibold text-[#E95312] hover:underline"
            >
              Try again
            </button>
          </div>
        ) : filteredBanks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#DDD7D2] bg-white p-12 text-center">
            <Building2 className="mx-auto h-10 w-10 text-[#C4C0BE]" />
            <h3 className="mt-3 text-base font-semibold text-[#1B3C4A]">
              No banks found
            </h3>
            <p className="mt-1 text-xs text-[#8A8583]">
              No partner banks matched your search query. Try searching with a
              different keyword.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredBanks.map((bank) => (
              <div
                key={bank.id}
                onClick={() => handleBankClick(bank)}
                className="group flex cursor-pointer items-center justify-between rounded-2xl border border-[#EDE8E4] bg-white p-4 sm:p-5 transition-all hover:border-[#E95312]/50 hover:shadow-sm"
              >
                <div className="flex min-w-0 items-center gap-3.5">
                  {/* Bank Logo */}
                  <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white p-1">
                    <BankLogo bank={bank} className="h-10 w-10" />
                  </div>
                  {/* Info */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-sm font-semibold text-[#1B3C4A] sm:text-base">
                        {bank.name}
                      </h3>
                      {renderBadge(bank)}
                    </div>
                    <p className="mt-0.5 text-xs text-[#8A8583]">
                      {channelLabels(bank).join(" · ") || "Digital banking"}
                    </p>
                  </div>
                </div>

                {/* Right Chevron */}
                <ChevronRight className="h-4 w-4 shrink-0 text-[#C4C0BE] transition-transform group-hover:translate-x-0.5 group-hover:text-[#E95312]" />
              </div>
            ))}
          </div>
        )}

        {/* Bottom Protected Verified Banks Banner */}
        <div className="relative flex min-h-[120px] items-center overflow-hidden rounded-2xl bg-[#D6EEE2]">
          {/* Left: text content */}
          <div className="z-10 shrink-0 px-6 py-6 sm:px-8">
            {/* PROTECTED pill */}
            <span className="inline-block rounded-full bg-[#B7DEC9] px-3 py-1 text-[10px] font-semibold tracking-widest text-[#2D7A56] uppercase">
              PROTECTED
            </span>
            <h3 className="mt-3 text-xl font-extrabold text-[#0F2A1E] sm:text-2xl">
              Verified banks only
            </h3>
            <p className="mt-1 text-xs text-[#6B8C7A] sm:text-sm">
              Every bank you can reach from Hatiso is registered and approved
            </p>
          </div>

          {/* Centre: CBN logo + label — absolutely centred horizontally */}
          <div className="absolute left-[80%] hidden -translate-x-1/2 items-center gap-2.5 sm:flex">
            <Image
              src="/cbn.svg"
              alt="Central Bank of Nigeria"
              width={206}
              height={206}
              className="object-contain"
              quality={95}
            />
          </div>

          {/* Right: banking.png — anchored to right edge, partially overflowing top */}
          <div className="absolute bottom-0 right-0 top-0 w-44 sm:w-52">
            <Image
              src="/banking.svg"
              alt=""
              fill
              className="object-cover object-left"
              quality={95}
              aria-hidden="true"
            />
          </div>
        </div>
      </section>

      {/* ── 2-STEP REDIRECTION MODAL ─────────────────────────────────── */}
      {modalStep && selectedBank && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-7">
            {/* Bank Logo */}
            <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-[#EDE8E4] bg-white p-1.5">
              <BankLogo
                bank={selectedBank}
                className="h-11 w-11"
                textClassName="text-xs"
              />
            </div>

            {/* STEP 1: Phone Number */}
            {modalStep === "phone" && (
              <Formik
                initialValues={{ phone: user?.phone || phoneNumber }}
                validationSchema={phoneStepSchema}
                onSubmit={() => {
                  window.open(
                    bankWebsite(selectedBank),
                    "_blank",
                    "noopener,noreferrer",
                  );
                  handleCloseModal();
                }}
              >
                <Form className="mt-4" noValidate>
                  <h2 className="text-xl font-bold text-[#1B3C4A]">
                    Continue to {selectedBank.name}
                  </h2>
                  <p className="mt-2 text-xs leading-relaxed text-[#736F6D] sm:text-sm">
                    You&apos;re about to open {selectedBank.name}&apos;s secure
                    banking service. Hatiso will never see your username,
                    password, PIN, or account details.
                  </p>

                  {/* <PhoneField
                    name="phone"
                    label="Phone Number"
                    required
                    variant="dashboard"
                    showCountryAffix={false}
                    placeholder="+234 904 637 3748"
                    className="mt-6"
                  />
 */}
                  <div className="mt-6 space-y-2.5">
                    <SubmitButton variant="primary" fullWidth>
                      Continue to bank
                    </SubmitButton>
                    <Button
                      variant="secondary"
                      fullWidth
                      onClick={handleCloseModal}
                    >
                      Cancel
                    </Button>
                  </div>
                </Form>
              </Formik>
            )}

            {/* STEP 2: OTP Verification */}
            {modalStep === "otp" && (
              <div className="mt-4">
                <h2 className="text-xl font-bold text-[#1B3C4A]">
                  Continue to {selectedBank.name}
                </h2>
                <p className="mt-2 text-xs leading-relaxed text-[#736F6D] sm:text-sm">
                  An OTP (One-Time Password) has been sent to your phone number.
                  Enter OTP below to verify your phone number.
                </p>

                <div className="mt-6">
                  <OtpInput
                    length={6}
                    value={otp}
                    onChange={(val) => {
                      setOtp(val);
                      if (otpError) setOtpError(false);
                    }}
                    hasError={otpError}
                    autoFocus
                  />
                </div>

                <div className="mt-6 space-y-2.5">
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={handleVerifyOtp}
                    disabled={isVerifying}
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Verifying identity...</span>
                      </>
                    ) : (
                      "Verify identity"
                    )}
                  </Button>
                  <Button
                    variant="secondary"
                    fullWidth
                    onClick={handleCloseModal}
                    disabled={isVerifying}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
