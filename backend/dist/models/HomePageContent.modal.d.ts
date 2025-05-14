import mongoose, { Document } from "mongoose";
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
interface IHomePageContent extends Document {
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
declare const _default: mongoose.Model<IHomePageContent, {}, {}, {}, mongoose.Document<unknown, {}, IHomePageContent> & IHomePageContent & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=HomePageContent.modal.d.ts.map