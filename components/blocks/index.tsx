import { tinaField } from "tinacms/dist/react";
import { Page, PageBlocks } from "../../tina/__generated__/types";
import dynamic from 'next/dynamic';

const components = {
  // 基本の8種類のブロックのみ（新規ブロック作成は無効化済み）
  PageBlocksVideo: dynamic(() => import('./video').then(mod => mod.Video)),
  PageBlocksHero: dynamic(() => import('./hero').then(mod => mod.Hero)),
  PageBlocksCallout: dynamic(() => import('./callout').then(mod => mod.Callout)),
  PageBlocksStats: dynamic(() => import('./stats').then(mod => mod.Stats)),
  PageBlocksContent: dynamic(() => import('./content').then(mod => mod.Content)),
  PageBlocksFeatures: dynamic(() => import('./features').then(mod => mod.Features)),
  PageBlocksTestimonial: dynamic(() => import('./testimonial').then(mod => mod.Testimonial)),
  PageBlocksCta: dynamic(() => import('./call-to-action').then(mod => mod.CallToAction)),

  // 以下は過去に生成された追加ブロック（既存コンテンツとの互換性のため保持）
  PageBlocksProfile: dynamic(() => import('./profile').then(mod => mod.Profile)),
  PageBlocksGallery: dynamic(() => import('./gallery').then(mod => mod.Gallery)),
  PageBlocksInformation: dynamic(() => import('./information').then(mod => mod.Information)),
  PageBlocksPricing_plan: dynamic(() => import('./pricing_plan').then(mod => mod.Pricing_plan)),
  PageBlocksPortfolio: dynamic(() => import('./portfolio').then(mod => mod.Portfolio)),
  PageBlocksCompany_profile: dynamic(() => import('./company_profile').then(mod => mod.Company_profile)),
  PageBlocksMenu: dynamic(() => import('./menu').then(mod => mod.Menu)),
  PageBlocksAccess_info: dynamic(() => import('./access_info').then(mod => mod.Access_info)),

  // 注意：新規ブロック作成機能は無効化されています
};

export const Blocks = (props: Omit<Page, "id" | "_sys" | "_values">) => {
  if (!props.blocks) return null;
  return (
    <>
      {props.blocks.map(function (block, i) {
        return (
          <div key={i} data-tina-field={tinaField(block)}>
            <Block {...block} />
          </div>
        );
      })}
    </>
  );
};

const Block = (block: PageBlocks) => {
  const Component = components[block.__typename as keyof typeof components];
  if (Component) {
    return <Component data={block as any} />;
  }
  return null;
};
