import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type DemoCardProps = {
  title: string;
  description?: string;
  // 데모에 사용된 훅/컴포넌트 이름 (코드 폰트 배지로 표시)
  tag?: string;
  children: React.ReactNode;
};

// 예제·문서에서 데모를 담는 공통 카드
export function DemoCard({ title, description, tag, children }: DemoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {title}
          {tag && (
            <Badge variant="outline" className="font-mono font-normal">
              {tag}
            </Badge>
          )}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-3">{children}</CardContent>
    </Card>
  );
}
