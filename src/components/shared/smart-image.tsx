"use client";

/* eslint-disable @next/next/no-img-element */
import Image, { ImageProps } from "next/image";

type SmartImageProps = Omit<ImageProps, "src"> & {
  src: string;
};

function normalizeSrc(src: string) {
  return src.trim();
}

function shouldUseNativeImage(src: string) {
  return src.startsWith("/api/uploads/") || src.startsWith("/uploads/");
}

export function SmartImage({ src, alt, fill, width, height, className, sizes, ...props }: SmartImageProps) {
  const normalizedSrc = normalizeSrc(src);

  if (shouldUseNativeImage(normalizedSrc)) {
    if (fill) {
      return (
        <img
          src={normalizedSrc}
          alt={alt}
          className={className ? `absolute inset-0 h-full w-full ${className}` : "absolute inset-0 h-full w-full"}
          sizes={sizes}
        />
      );
    }

    return (
      <img
        src={normalizedSrc}
        alt={alt}
        width={typeof width === "number" ? width : undefined}
        height={typeof height === "number" ? height : undefined}
        className={className}
      />
    );
  }

  return (
    <Image
      src={normalizedSrc}
      alt={alt}
      fill={fill}
      width={width}
      height={height}
      className={className}
      sizes={sizes}
      {...props}
    />
  );
}
