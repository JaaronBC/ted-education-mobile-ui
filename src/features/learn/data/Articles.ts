import { ImageSourcePropType } from 'react-native';
import { Href } from 'expo-router';

export interface ArticleData {
    key: number;
    thumbnail: ImageSourcePropType;
    accessibilityLabel: string;
    name: string;
    description: string;
    link: Href;
};

export const Articles: ArticleData[] = [
    {
        key: 1,
        thumbnail: require('../../../../assets/images/what-is-ted-image.jpg'),
        name: "What is TED?",
        accessibilityLabel: "What is TED?",
        description: "Helpful information about TED.",
        link: "/whatisted"
    },
    {
        key: 2,
        thumbnail: require('../../../../assets/images/lifestyle-image.jpg'),
        name: "Lifestyle Considerations",
        accessibilityLabel: "Lifestyle Considerations",
        description: "Lifestyle considerations for TED patients.",
        link: "/lifestyle"
    },
    {
        key: 3,
        thumbnail: require('../../../../assets/images/support-groups-image.jpg'),
        name: "TED Support Groups",
        accessibilityLabel: "TED Support Groups",
        description: "Find support groups for TED patients.",
        link: "/tedsupport"
    },
    {
        key: 4,
        thumbnail: require('../../../../assets/images/lifestyle-considerations-image.jpg'),
        name: "Treatment Options",
        accessibilityLabel: "Treatment Options",
        description: "Find treatments and medications for TED.",
        link: "/treatment"
    },
    {
        key: 5,
        thumbnail: require('../../../../assets/images/risk-factors-image.jpg'),
        name: "Specialties Treating TED",
        accessibilityLabel: "TED Specialists",
        description: "Find specialists treating TED.",
        link: "/tedspecialist"
    },
];