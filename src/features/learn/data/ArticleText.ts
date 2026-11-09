
export interface TextData {
    header: string;
    paragraphs: string[];
    key: number;
};

export const ArticleText: TextData[] = [
    {
        header: "What is TED?",
        paragraphs: [
            "Thyroid Eye Disease (TED) is an autoimmune condition where the body’s immune system mistakenly attacks and causes inflammation of the muscles and fat around your eyes. This can affect the way your eyes appear, feel, and move.",
            "TED commonly occurs in people who have a history of Graves Disease (hyperthyroidism), though it can also occur in those with Hashimoto’s disease (hypothyroidism) or even those with normal levels.",
            "Common Symptoms include:\n\tBulging eyes (Proptosis)\n\tDry Eyes\n\tRedness or swelling of eyelid\n\tEyes that appear more open or retracted\n\tDouble vision\n\tPain or pressure behind eyes",
            "Some risk factors include:",
            "Active vs inactive:",
        ],
        key: 1,
    },
    {
        header: "Lifestyle Considerations",
        paragraphs: [
            "Smoking cessation",
            "Excercise and healthy diet",
            "Stress management",
        ],
        key: 2,
    },
    {
        header: "TED Support Groups",
        paragraphs: [
            "Grave’s Disease and Thyroid Foundation (GDATF):\nhttps://gdatf.org/",
            "TED Community Organization:\nhttps://tedcommunity.org/",
            "Thyroid Eye Disease Awareness & Education Facebook Group:\nhttps://www.facebook.com/groups/1299531523518774/",
            "Thyroid Eye Disease Facebook Page:\nhttps://www.facebook.com/ThyroidEyes/",

        ],
        key: 3,
    },
    {
        header: "Treatment Options",
        paragraphs: [
            "Selenium Supplementation",
            "Thyroidectomy vs. Radioactive Iodine",
            "Statins",
            "Smoking Cessation",
            "Dry Eye Treatment Options:\n\t-Artificial tears/lubricants\n\t-Punctual plugs\n\t-Prescription medications\n\t-Other treatments/surgeries for TED",
            "Diplopia (Double Vision) Treatment Options:\n\t-Prism glasses\n\t-Patching\n\t-Other treatments for TED",
            "Teprotumumab (Tepezza)/Veligrotug (Lumvoa)",
            "Satralizumab (Enspryng)",
            "Orbital Radiation Therapy",
            "Steroid Injections (For upper eyelid retraction)",
            "Surgical Options:\n\t-Orbital Decompression\n\t-Strabismus Surgery\n\t-Eyelid Retraction Repair",

        ],
        key: 4,
    },
    {
        header: "Specialties Treating TED",
        paragraphs: [
            "Endoccrinologists:\nAnna Lo\nCindy Pau\nEric Lee\nAlan Parsa\nKamonkiat Wirunsawanya(HPH)",
            "Adult Strabismus Specialists:\nDavid Young\nRupa Wong\nPeggy Liao",
            "Radiation Oncologists:\nQueens Radiation Center of Hawaii (Oahu)\nCancer Center of Hawaii (Oahu)\nPacific Cancer Institute (Maui)\nEast Hawaii Health Cancer Center (Hilo)",
            "Thyroid Surgeons:\nWhitney Limm (General Surgery, Queens)\nJohn Balfour (General Surgery, HPH)\nStacey Woodruff (General Surgery, Queens)\nZhen Gooi (ENT, Queens)\nTimothy Stoddard (ENT, HPH)",
            "Oculofacial Plastic Surgeons:\nBradford Lee\nAdam Sweeney\nMarcus Ko\nCarlthan Ling\nAmelia Fong",
        ],
        key: 5,
    },
];