import { nanoid } from 'nanoid';

export const imageId = () => `img_${nanoid(12)}`;
export const albumId = () => `alb_${nanoid(10)}`;
