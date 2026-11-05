import ArticleFormat from '@/features/learn/ArticleFormat';
import { ArticleText } from '@/features/learn/data/ArticleText';

export default function whatScreen() {
    return (
        <ArticleFormat article={{
            header: ArticleText[0].header,
            paragraphs: ArticleText[0].paragraphs,
            key: 1,
        }}
        />
    );
}