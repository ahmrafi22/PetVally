"use client";

import React from "react";
import { useRouter } from "next/navigation";
import styles from "./button-css.module.css"; 

interface GlassButtonProps {
  href: string;
  text: string;
}

const GlassButton: React.FC<GlassButtonProps> = ({ href, text }) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(href);
  };

  return (
    <div className={styles.buttonWrap}>
      <div className={styles.buttonShadow}></div>
      <button className={styles.button} onClick={handleClick}>
        <span className={styles.buttonText}>{text} </span>
      </button>
    </div>
  );
};

export default GlassButton;