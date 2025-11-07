export type Bank = { name: string; code: string };
export const BANKS: Bank[] = [
    { name: "UOB Bank", code: "UOVBMYKL" },
    { name: "Affin Bank", code: "PHBMMYKL" },
    { name: "Agrobank", code: "AGOBMYKL" },
    { name: "Al Rajhi Bank", code: "RJHIMYKL" },
    { name: "Alliance Bank", code: "MFBMMYKL" },
    { name: "Ambank", code: "ARBKMYKL" },
    { name: "Bank Islam", code: "BIMBMYKL" },
    { name: "Bank Kerjasama Rakyat", code: "BKRMMYKL" },
    { name: "Bank Muamalat", code: "BMMBMYKL" },
    { name: "Bank Simpanan Nasional", code: "BSNAMYK1" },
    { name: "CIMB Bank", code: "CIBBMYKL" },
    { name: "Hong Leong Bank", code: "HLBBMYKL" },
    { name: "HSBC Bank", code: "HBMBMYKL" },
    { name: "Kuwait Finance House", code: "KFHOMYKL" },
    { name: "Maybank", code: "MBBEMYKL" },
    { name: "OCBC Bank", code: "OCBCMYKL" },
    { name: "Public Bank", code: "PBBEMYKL" },
    { name: "RHB Bank", code: "RHBBMYKL" },
    { name: "Standard Chartered Bank", code: "SCBLMYKX" },

];
export const BANKS_BY_CODE: Record<string, Bank> =
    Object.fromEntries(BANKS.map(b => [b.code.toUpperCase(), b])) as Record<string, Bank>;

export const getBankNameByCode = (code?: string) =>
    code ? BANKS_BY_CODE[code.toUpperCase()]?.name ?? null : null;