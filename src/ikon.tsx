import type { SVGProps } from 'react'
const T = (p: SVGProps<SVGSVGElement>) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...p} />
)
export const IFatura = () => (<T><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" /><path d="M9 8h6M9 12h6M9 16h3" /></T>)
export const IGaranti = () => (<T><path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6z" /><path d="M9 12l2 2 4-4" /></T>)
export const IAbonelik = () => (<T><path d="M20 12a8 8 0 1 1-2.3-5.6" /><path d="M20 4v4h-4" /><path d="M12 8v4l2.5 2" /></T>)
export const IArti = () => (<T><path d="M12 5v14M5 12h14" /></T>)
export const ISol = () => (<T><path d="M15 6l-6 6 6 6" /></T>)
export const ISag = () => (<T><path d="M9 6l6 6-6 6" /></T>)
export const IKapat = () => (<T><path d="M6 6l12 12M18 6L6 18" /></T>)
export const IBelge = () => (<T width="18" height="18"><path d="M7 3h7l4 4v14H7z" /><path d="M14 3v4h4" /></T>)
export const IFoto = () => (<T width="18" height="18"><rect x="3" y="5" width="18" height="14" rx="1.5" /><circle cx="9" cy="10" r="1.6" /><path d="M21 16l-5-5-8 8" /></T>)
export const ITik = ({ acik }: { acik: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
    <rect x="3.5" y="3.5" width="17" height="17" rx="3" fill={acik ? 'var(--vurgu)' : 'none'} stroke={acik ? 'var(--vurgu)' : 'var(--cizgi-koyu)'} strokeWidth="1.6" />
    {acik && <path d="M8 12.5l2.7 2.7L16 9.8" fill="none" stroke="var(--zemin)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />}
  </svg>
)
