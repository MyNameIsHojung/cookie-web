import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/utils/format';
import { sanitize } from '@/utils/validation';
import {
  CATEGORY_LABELS,
  type Product,
  type ProductCategory,
} from '@/types';

const emptyProduct = {
  name: '',
  description: '',
  price: 0,
  category: 'cookie' as ProductCategory,
  stock: 0,
  is_available: true,
  sort_order: 0,
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('sort_order')
      .order('created_at', { ascending: false });
    setProducts((data as Product[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);

    try {
      let imageUrl = editing.image_url || null;

      // 이미지 업로드
      if (imageFile) {
        const ext = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, imageFile, {
            cacheControl: '3600',
            upsert: false,
          });
        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);
        imageUrl = publicUrl;
      }

      const payload = {
        name: sanitize(editing.name || ''),
        description: sanitize(editing.description || ''),
        price: Math.max(0, Number(editing.price) || 0),
        category: editing.category || 'cookie',
        stock: Math.max(0, Number(editing.stock) || 0),
        is_available: editing.is_available ?? true,
        sort_order: Number(editing.sort_order) || 0,
        image_url: imageUrl,
      };

      if (editing.id) {
        const { error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('products').insert(payload);
        if (error) throw error;
      }

      setEditing(null);
      setImageFile(null);
      await fetchProducts();
    } catch (err) {
      alert(
        err instanceof Error ? err.message : '저장 중 오류가 발생했습니다.',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    await supabase.from('products').delete().eq('id', id);
    await fetchProducts();
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-brand-plum">상품 관리</h1>
        <button
          onClick={() => setEditing({ ...emptyProduct })}
          className="btn-primary"
        >
          + 상품 추가
        </button>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold text-brand-plum">
              {editing.id ? '상품 수정' : '상품 추가'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">상품명</label>
                <input
                  className="input-field"
                  value={editing.name || ''}
                  onChange={(e) =>
                    setEditing({ ...editing, name: e.target.value })
                  }
                  maxLength={100}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">설명</label>
                <textarea
                  className="input-field resize-none"
                  rows={3}
                  value={editing.description || ''}
                  onChange={(e) =>
                    setEditing({ ...editing, description: e.target.value })
                  }
                  maxLength={2000}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    가격 (원)
                  </label>
                  <input
                    type="number"
                    className="input-field"
                    value={editing.price || 0}
                    onChange={(e) =>
                      setEditing({ ...editing, price: Number(e.target.value) })
                    }
                    min={0}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">재고</label>
                  <input
                    type="number"
                    className="input-field"
                    value={editing.stock || 0}
                    onChange={(e) =>
                      setEditing({ ...editing, stock: Number(e.target.value) })
                    }
                    min={0}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    카테고리
                  </label>
                  <select
                    className="input-field"
                    value={editing.category || 'cookie'}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        category: e.target.value as ProductCategory,
                      })
                    }
                  >
                    {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    정렬 순서
                  </label>
                  <input
                    type="number"
                    className="input-field"
                    value={editing.sort_order || 0}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        sort_order: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  상품 이미지
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setImageFile(e.target.files?.[0] || null)
                  }
                  className="text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_available"
                  checked={editing.is_available ?? true}
                  onChange={(e) =>
                    setEditing({ ...editing, is_available: e.target.checked })
                  }
                />
                <label htmlFor="is_available" className="text-sm">
                  판매 중
                </label>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setEditing(null);
                  setImageFile(null);
                }}
                className="btn-secondary flex-1"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !editing.name}
                className="btn-primary flex-1"
              >
                {saving ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <p className="py-12 text-center text-gray-400">
          등록된 상품이 없습니다.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500">
                <th className="px-3 py-3">이미지</th>
                <th className="px-3 py-3">상품명</th>
                <th className="px-3 py-3">카테고리</th>
                <th className="px-3 py-3">가격</th>
                <th className="px-3 py-3">재고</th>
                <th className="px-3 py-3">상태</th>
                <th className="px-3 py-3">관리</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-3 py-3">
                    <div className="h-10 w-10 overflow-hidden rounded-lg bg-gray-100">
                      {p.image_url ? (
                        <img
                          src={p.image_url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="flex h-full items-center justify-center text-lg">
                          🍰
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3 font-medium">{p.name}</td>
                  <td className="px-3 py-3">{CATEGORY_LABELS[p.category]}</td>
                  <td className="px-3 py-3">{formatPrice(p.price)}</td>
                  <td className="px-3 py-3">{p.stock}</td>
                  <td className="px-3 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        p.is_available
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {p.is_available ? '판매중' : '숨김'}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditing(p)}
                        className="rounded bg-brand-teal/10 px-2 py-1 text-xs font-medium text-brand-teal hover:bg-brand-teal/20"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="rounded bg-red-50 px-2 py-1 text-xs font-medium text-red-500 hover:bg-red-100"
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
