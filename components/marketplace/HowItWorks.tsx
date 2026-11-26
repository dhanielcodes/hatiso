import React from 'react';

const STEPS = [
  { n: '01', title: 'Choose a service', body: 'Airtime, data, power, TV and more, from providers you already use.' },
  { n: '02', title: 'Enter the details', body: 'Add the phone number, meter or smartcard and pick an amount. We check it before you pay.' },
  { n: '03', title: 'Pay and get a receipt', body: 'Pay securely and your receipt arrives straight away. Sign up to keep your history.' },
];

/** "How it works": three numbered steps under a Carbon rule (Main board). */
export default function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 bg-white text-carbon">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-12 px-[clamp(16px,4vw,56px)] py-[clamp(72px,9vw,120px)]">
        <div className="hz-reveal flex max-w-[640px] flex-col gap-4">
          <p className="hz-eyebrow text-grey-600">How it works</p>
          <h2 className="text-[clamp(32px,4vw,52px)] leading-[1.08] font-semibold tracking-[-0.03em]">Paid in under a minute.</h2>
        </div>
        <ol className="grid grid-cols-[repeat(auto-fit,minmax(min(280px,100%),1fr))] border-t border-carbon">
          {STEPS.map((step) => (
            <li key={step.n} className="hz-reveal flex flex-col gap-3.5 pt-7 pr-7 pb-2">
              <span className="text-[15px] font-semibold text-grey-400">{step.n}</span>
              <span className="text-[22px] font-semibold tracking-[-0.015em]">{step.title}</span>
              <span className="max-w-[340px] text-[15px] leading-relaxed text-grey-600">{step.body}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
