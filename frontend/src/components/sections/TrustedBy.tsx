import Image from "next/image";

export function TrustedBy() {
    return (
        <div className="bg-main-black py-8 sm:py-12 xl:py-20 space-y-8 text-xl font-montserrat text-brand font-semibold text-center">
            <h2>Trusted by Stock Company & Popular Universities</h2>
            <Image src="/maskgroup.svg" alt="Hero" width={1920} height={1080} className='w-full h-auto relative z-10' />
        </div >
    )
}