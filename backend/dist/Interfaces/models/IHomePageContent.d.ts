import { Document, Types } from "mongoose";
interface IFeature {
    title: string;
    description: string[];
    icon: string;
}
interface IFooterLink {
    name: string;
    url: string;
}
interface ISocialMedia {
    name: string;
    url: string;
    icon: string;
}
export interface IHomePageContent extends Document {
    _id: Types.ObjectId;
    HomePageContentId: string;
    banner: {
        imageUrl: string;
        tagline: string;
        title: string;
        description: string;
    };
    features: IFeature[];
    footer: {
        links: IFooterLink[];
        socialMedia: ISocialMedia[];
        copyright: string;
    };
}
export {};
//# sourceMappingURL=IHomePageContent.d.ts.map