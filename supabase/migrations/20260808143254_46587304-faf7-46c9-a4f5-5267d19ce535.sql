INSERT INTO public.tool_configs (tool_id, name, short_name, description, long_description, badge, is_active, display_order, department_id)
VALUES (
  'product-photography',
  'Product Photography',
  'Product',
  'Turn raw product photos into a 5-shot commercial photoshoot.',
  'Upload up to 10 photos of your product, describe it, and give your creative direction. AI generates five premium, true-to-product commercial photographs ready for e-commerce and ads.',
  '5 Shots',
  true,
  16,
  '907cefdb-b91d-4224-8257-4dcb4b3b4deb'
)
ON CONFLICT (tool_id) DO UPDATE SET
  name = EXCLUDED.name,
  is_active = true,
  department_id = EXCLUDED.department_id;