import type { SVGProps } from 'react'
const T = ({ boyut = 22, ...p }: SVGProps<SVGSVGElement> & { boyut?: number }) => (
  <svg width={boyut} height={boyut} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...p} />
)
export const IFatura = ({ boyut }: { boyut?: number }) => (<T boyut={boyut}><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" /><path d="M9 8h6M9 12h6M9 16h3" /></T>)
export const IGaranti = ({ boyut }: { boyut?: number }) => (<T boyut={boyut}><path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6z" /><path d="M9 12l2 2 4-4" /></T>)
export const IAbonelik = ({ boyut }: { boyut?: number }) => (<T boyut={boyut}><path d="M20 12a8 8 0 1 1-2.3-5.6" /><path d="M20 4v4h-4" /><path d="M12 8v4l2.5 2" /></T>)
export const IArti = () => (<T><path d="M12 5v14M5 12h14" /></T>)
export const ISol = () => (<T><path d="M15 6l-6 6 6 6" /></T>)
export const ISag = () => (<T><path d="M9 6l6 6-6 6" /></T>)
export const IKapat = () => (<T boyut={20}><path d="M6 6l12 12M18 6L6 18" /></T>)
export const ICikis = () => (<T boyut={20}><path d="M14 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4" /><path d="M10 8l-4 4 4 4M6 12h9" /></T>)
export const IBelge = () => (<T boyut={18}><path d="M7 3h7l4 4v14H7z" /><path d="M14 3v4h4" /></T>)
export const IFoto = () => (<T boyut={18}><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="10" r="1.6" /><path d="M21 16l-5-5-8 8" /></T>)
export const ITik = ({ acik }: { acik: boolean }) => (
  <span className={acik ? 'tik acik' : 'tik'}>
    <span>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--paper)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M5 12.5l4.5 4.5L19 7.5" />
      </svg>
    </span>
  </span>
)
