import ArticleFormat from '@/features/learn/ArticleFormat';
import { ArticleText } from '@/features/learn/data/ArticleText';

export default function specialistScreen() {
    return (
        <ArticleFormat article={{
            header: ArticleText[4].header,
            paragraphs: ArticleText[4].paragraphs,
            key: 5,
        }}
        />
    );
}