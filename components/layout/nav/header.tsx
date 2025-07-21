"use client";

import React from "react";
import Link from "next/link";
import { Icon } from "../../icon";
import { useLayout } from "../layout-context";

export const Header = () => {
  const { globalSettings, theme } = useLayout();
  const header = globalSettings!.header!;

  return (
    <header>
      <nav
        className="bg-background/50 fixed z-20 w-full border-b backdrop-blur-3xl">
        <div className="mx-auto max-w-6xl px-6 transition-all duration-300">
          <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
            <div className="flex w-full items-center justify-between gap-12">
              <Link
                href="/"
                aria-label="home"
                className="flex items-center space-x-2">
                <Icon
                  parentColor={header.color!}
                  data={{
                    name: header.icon!.name,
                    color: header.icon!.color,
                    style: header.icon!.style,
                  }}
                />{" "}
                <span>
                  {header.name}
                </span>
              </Link>

              {header.nav && header.nav.length > 0 && (
                <div className="hidden lg:block">
                  <ul className="flex gap-8 text-sm">
                    {header.nav!.map((item, index) => (
                      <li key={index}>
                        <Link
                          href={item!.href!}
                          className="text-muted-foreground hover:text-accent-foreground block duration-150"
                        >
                          <span>{item!.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

          </div>
        </div>
      </nav>
    </header>
  )
}
