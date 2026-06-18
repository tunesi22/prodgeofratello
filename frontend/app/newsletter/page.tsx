import Image from "next/image";
import Link from "next/link";

export default function NewsletterPage() {
  return (
    <main className="relative min-h-screen bg-[#121212] text-[#ffffeb]">
      <header className="absolute left-1/2 top-8 z-10 flex w-[calc(100vw-48px)] max-w-[1280px] -translate-x-1/2 items-center justify-between md:top-12 md:w-[calc(100vw-160px)]">
        <Link aria-label="Back to Fratello home" href="/" className="block h-[28.5px] w-[39.25px]">
          <Image src="/logo-mark.svg" alt="" width={39} height={29} priority className="h-full w-full" />
        </Link>
        <Link
          href="/#join-waitlist"
          className="rounded-full bg-[#006b3e] px-4 py-3 text-[16px] font-medium leading-none text-white transition hover:bg-[#005934] focus:outline-none focus:ring-2 focus:ring-white/70"
        >
          Join Waitlist
        </Link>
      </header>

      <article className="mx-auto grid w-[calc(100vw-48px)] max-w-[720px] gap-10 pb-44 pt-32 md:grid-cols-[160px_1fr] md:gap-20 md:pb-48 md:pt-[161px]">
        <aside className="font-serif leading-[1.2] text-[#ffffeb]">
          <h1 className="text-[40px] font-normal tracking-normal">Day 1</h1>
          <p className="mt-2 text-[24px] font-normal tracking-normal">2 Juni 2026</p>
        </aside>

        <div className="space-y-[30px] text-[20px] font-normal leading-[1.5] tracking-normal text-[#ffffeb]">
          <p>Halo semuanya!</p>
          <p>
            Mau kenalin dulu jadi{" "}
            <strong className="font-serif font-bold">Fratello</strong> adalah produk SaaS
            yang kami bangun untuk membantu produk atau brand kamu lebih mudah "dibaca"
            oleh AI, seperti ChatGPT, Gemini, Claude, dan AI search lainnya.
          </p>
          <div className="space-y-0">
            <p className="italic">Kenapa ini penting?</p>
            <p>Bayangin ada turis dari luar negeri yang nanya ke ChatGPT:</p>
            <p>
              "Rekomendasi restoran Indonesia di Bandung yang enak apa ya?" Lalu dari
              semua jawaban yang muncul, nama restoran kamu ikut direkomendasikan.
            </p>
          </div>
          <div className="space-y-0">
            <p className="italic">Kebayang kan dampaknya?</p>
            <p>
              Itulah masalah yang ingin kami bantu selesaikan lewat{" "}
              <strong className="font-serif font-bold">Fratello</strong>. Karena ke
              depannya, orang tidak cuma mencari lewat Google. Mereka juga akan bertanya
              ke AI.
            </p>
          </div>
          <p>
            Daily Notes ini kami buat supaya kalian bisa ikut melihat proses kami membangun
            Fratello dari nol. Bukan cuma bagian yang terlihat keren, tapi juga proses yang
            berantakan, eksperimen yang gagal, keputusan kecil yang kami ambil, dan
            pelajaran yang kami dapat setiap hari.
          </p>
          <p>
            Masih panjang jalannya, tapi kami excited to build{" "}
            <strong className="font-serif font-bold">Fratello.</strong> Langsung ajah
            masukkin email kalian buat masuk jadi waitlist nya.
          </p>
          <div className="space-y-0">
            <p>-A</p>
            <p>Co-founder <strong className="font-serif font-bold">Fratello</strong></p>
          </div>
        </div>
      </article>

      <footer className="mx-auto flex w-[calc(100vw-48px)] max-w-[720px] items-center justify-center pb-12 text-center text-[#ffffeb]">
        <p className="font-serif text-[18px] font-normal leading-[1.2] tracking-normal md:text-[24px]">
          Made possible by <span className="font-sans font-bold">Nine Ten Studios</span>
        </p>
      </footer>
    </main>
  );
}
