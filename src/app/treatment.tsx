import ArticleFormat from '@/features/learn/ArticleFormat';
import { ArticleText } from '@/features/learn/data/ArticleText';

export default function treatmentScreen() {
    return (
        <ArticleFormat article={{
            header: ArticleText[3].header,
            paragraphs: ArticleText[3].paragraphs,
            key: 4,
        }}
        />
    );
}