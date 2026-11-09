import ArticleFormat from '@/features/learn/ArticleFormat';
import { ArticleText } from '@/features/learn/data/ArticleText';

export default function lifestyleScreen() {
    return (
        <ArticleFormat article={{
            header: ArticleText[1].header,
            paragraphs: ArticleText[1].paragraphs,
            key: 2,
        }}
        />
    );
}