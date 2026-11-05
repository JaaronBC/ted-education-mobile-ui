import ArticleFormat from '@/features/learn/ArticleFormat';
import { ArticleText } from '@/features/learn/data/ArticleText';

export default function supportScreen() {
    return (
        <ArticleFormat article={{
            header: ArticleText[2].header,
            paragraphs: ArticleText[2].paragraphs,
            key: 3,
        }}
        />
    );
}