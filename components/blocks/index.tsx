import { tinaField } from "tinacms/dist/react";
import { Page, PageBlocks } from "../../tina/__generated__/types";
import dynamic from 'next/dynamic';

const components = {
  PageBlocksVideo: dynamic(() => import('./video').then(mod => mod.Video)),
  PageBlocksHero: dynamic(() => import('./hero').then(mod => mod.Hero)),
  PageBlocksCallout: dynamic(() => import('./callout').then(mod => mod.Callout)),
  PageBlocksStats: dynamic(() => import('./stats').then(mod => mod.Stats)),
  PageBlocksContent: dynamic(() => import('./content').then(mod => mod.Content)),
  PageBlocksFeatures: dynamic(() => import('./features').then(mod => mod.Features)),
  PageBlocksTestimonial: dynamic(() => import('./testimonial').then(mod => mod.Testimonial)),
  PageBlocksCta: dynamic(() => import('./call-to-action').then(mod => mod.CallToAction)),
  PageBlocksProfile: dynamic(() => import('./profile').then(mod => mod.Profile)),
  // Note: New blocks will need to be added here manually for now.
  // A fully dynamic solution would require a build step to generate this mapping.
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
