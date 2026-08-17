import React from 'react';
import { RecipeSkeletonGrid } from './RecipeCardSkeleton';

export const LoadingSkeleton = ({ count = 6 }) => {
  return <RecipeSkeletonGrid count={count} />;
};

export default LoadingSkeleton;
