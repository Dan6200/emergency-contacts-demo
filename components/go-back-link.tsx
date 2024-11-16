"use client";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { FC, ReactNode } from "react";

interface GoBackLinkProps {
  className: string;
  children: ReactNode;
  url?: string;
}

export const GoBackLink: FC<GoBackLinkProps> = ({
  className,
  children,
  url,
}) => {
  const router = useRouter();
  return (
    <a
      className={className}
      onClick={url ? () => router.push(url) : () => router.back()}
    >
      <ArrowLeft />
      {children}
    </a>
  );
};
