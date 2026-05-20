'use client'

import { useState } from 'react'
import { Plus, Trash2, Edit, X, Image, Percent, FileText, Upload, Check, Save } from 'lucide-react'
import { addProduct, editProduct, deleteProduct, addHeroSlide, deleteHeroSlide, updateGlobalDiscount, updatePriceList } from './actions'

type Product = {
  id: string
  name: string
  price: number
  stock: number
  type: string
  imagePath: string | null
}

type Slide = {
  id: string
  imagePath: string
}

type Stats = {
  totalOrders: number
  monthlyRevenue: number
  totalProducts: number
  pendingOrders: number
}

// Helpers for client-side PDF parsing
const loadPdfJs = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if ((window as any).pdfjsLib) {
      resolve((window as any).pdfjsLib);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      const pdfjsLib = (window as any).pdfjsLib;
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      resolve(pdfjsLib);
    };
    script.onerror = (err) => reject(err);
    document.head.appendChild(script);
  });
};

const parsePdfFile = async (file: File) => {
  const pdfjsLib = await loadPdfJs();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  let allTextLines: string[] = [];
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const items = textContent.items as any[];
    
    const sortedItems = [...items].sort((a, b) => {
      if (Math.abs(a.transform[5] - b.transform[5]) < 5) {
        return a.transform[4] - b.transform[4];
      }
      return b.transform[5] - a.transform[5];
    });
    
    let currentLine = '';
    let lastY = -1;
    
    for (const item of sortedItems) {
      const y = item.transform[5];
      if (lastY === -1) {
        currentLine = item.str;
      } else if (Math.abs(y - lastY) > 5) {
        if (currentLine.trim()) {
          allTextLines.push(currentLine);
        }
        currentLine = item.str;
      } else {
        currentLine += ' ' + item.str;
      }
      lastY = y;
    }
    if (currentLine.trim()) {
      allTextLines.push(currentLine);
    }
  }
  
  return allTextLines;
};

const parseLinesToItems = (lines: string[]) => {
  const parsedItems: any[] = [];
  let currentCategory = 'Sound Crackers';
  
  const categoryKeywords = [
    'sparkler', 'chakkar', 'flower pot', 'novelty', 'fancy', 'sky shot', 
    'fancy shower', 'sound', 'atom bomb', 'bijili', 'garland', 'chosa'
  ];
  
  let snoCounter = 1;
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    if (/page \d+/i.test(trimmed) || /price list/i.test(trimmed) || /kumki/i.test(trimmed) || /invoice/i.test(trimmed)) {
      continue;
    }
    
    const lowerLine = trimmed.toLowerCase();
    let isHeader = false;
    for (const catKeyword of categoryKeywords) {
      if (lowerLine.includes(catKeyword) && trimmed.split(/\s+/).length <= 4 && !/\d+/.test(trimmed)) {
        currentCategory = trimmed;
        isHeader = true;
        break;
      }
    }
    if (isHeader) continue;
    
    const snoMatch = trimmed.match(/^(\d+)[\.\s\-]+/);
    let sno = snoCounter.toString();
    let rest = trimmed;
    if (snoMatch) {
      sno = snoMatch[1];
      rest = trimmed.substring(snoMatch[0].length).trim();
    }
    
    const priceMatch = rest.match(/[\s₹Rs\.\/-]+(\d+(?:\.\d+)?)\s*$/i);
    let priceStr = '0';
    if (priceMatch) {
      priceStr = priceMatch[1];
      rest = rest.substring(0, rest.length - priceMatch[0].length).trim();
    } else {
      continue;
    }
    
    const packRegex = /(\d+\s*(?:pcs|pc|box|pack|pkt|packet|roll|bundle|cm|inch|shot|shots|bag|pot|pots|feet|mtr|meters|mtrs))\b/i;
    const packMatch = rest.match(packRegex);
    let pack = '1 Box';
    let name = rest;
    
    if (packMatch) {
      pack = packMatch[1];
      name = rest.replace(packRegex, '').trim();
    }
    
    name = name.replace(/^[\.\-\s]+|[\.\-\s]+$/g, '').trim();
    if (name.length < 2) continue;
    
    parsedItems.push({
      sno,
      category: currentCategory,
      name,
      pack,
      price: parseFloat(priceStr)
    });
    
    snoCounter++;
  }
  
  return parsedItems;
};

export function AdminProductManager({ 
  products, 
  heroSlides, 
  stats, 
  globalDiscount,
  priceListPdf,
  priceListData
}: { 
  products: Product[], 
  heroSlides: Slide[], 
  stats: Stats, 
  globalDiscount: number,
  priceListPdf: string | null,
  priceListData: string | null
}) {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(false)
  const [heroLoading, setHeroLoading] = useState(false)

  // Price List States
  const initialItems = priceListData ? JSON.parse(priceListData) : [];
  const [priceListItems, setPriceListItems] = useState<any[]>(initialItems);
  const [newPdfFile, setNewPdfFile] = useState<File | null>(null);
  const [pdfParsing, setPdfParsing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const handleCellChange = (index: number, field: string, value: any) => {
    const updated = [...priceListItems];
    updated[index] = { ...updated[index], [field]: value };
    setPriceListItems(updated);
  };

  const handleAddRow = () => {
    setPriceListItems([
      ...priceListItems,
      {
        sno: (priceListItems.length + 1).toString(),
        category: 'Sound Crackers',
        name: 'New Product',
        pack: '1 Box',
        price: 0
      }
    ]);
  };

  const handleDeleteRow = (index: number) => {
    setPriceListItems(priceListItems.filter((_, i) => i !== index));
  };

  const handlePdfUploadAndParse = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewPdfFile(file);
    
    setPdfParsing(true);
    try {
      const lines = await parsePdfFile(file);
      const items = parseLinesToItems(lines);
      if (items.length === 0) {
        alert("Could not extract any product rows automatically. Please verify your PDF format or add rows manually.");
      } else {
        setPriceListItems(items);
        alert(`Successfully parsed ${items.length} items from PDF! Review them in the table below before saving.`);
      }
    } catch (err) {
      console.error(err);
      alert("Error parsing PDF. You can still save the file or add rows manually.");
    } finally {
      setPdfParsing(false);
    }
  };

  const handleSavePriceList = async () => {
    setSaveLoading(true);
    try {
      const formData = new FormData();
      if (newPdfFile) {
        formData.append('pdfFile', newPdfFile);
      }
      formData.append('priceListData', JSON.stringify(priceListItems));
      await updatePriceList(formData);
      alert('Price list saved successfully!');
      setNewPdfFile(null);
    } catch (err) {
      alert('Failed to save price list: ' + err);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    setLoading(true)
    await addProduct(new FormData(form))
    setLoading(false)
    form.reset()
  }

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    setLoading(true)
    await editProduct(new FormData(form))
    setLoading(false)
    setEditingProduct(null)
  }

  const handleHeroUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    setHeroLoading(true)
    await addHeroSlide(new FormData(form))
    setHeroLoading(false)
    form.reset()
  }

  return (
    <div>
      {/* Dashboard Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Monthly Orders</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{stats.totalOrders}</div>
        </div>
        <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Monthly Revenue</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>₹{stats.monthlyRevenue.toFixed(0)}</div>
        </div>
        <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Total Products</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{stats.totalProducts}</div>
        </div>
        <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Pending Orders</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--secondary)' }}>{stats.pendingOrders}</div>
        </div>
      </div>

      {/* Hero Slider Manager */}
      <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '3rem', border: '1px solid var(--border)' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Hero Slider Images</h3>
        <form onSubmit={handleHeroUpload} style={{ display: 'flex', gap: '1rem', alignItems: 'end', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Add Slide Image</label>
            <input type="file" name="imageFile" accept="image/*" className="input-field" required style={{ padding: '0.5rem' }} />
          </div>
          <button type="submit" disabled={heroLoading} className="btn-primary">
            {heroLoading ? 'Uploading...' : 'Add Slide'}
          </button>
        </form>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {heroSlides.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No slides added yet.</p>}
          {heroSlides.map((slide) => (
            <div key={slide.id} style={{ position: 'relative', width: '150px', height: '100px', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid var(--border)' }}>
              <img src={slide.imagePath} alt="Slide" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <form action={deleteHeroSlide} style={{ position: 'absolute', top: '4px', right: '4px' }}>
                <input type="hidden" name="id" value={slide.id} />
                <button type="submit" style={{ background: 'rgba(212,69,11,0.9)', color: '#fff', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                  <X size={14} />
                </button>
              </form>
            </div>
          ))}
        </div>
      </div>

      {/* Global Discount Setting */}
      <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '3rem', border: '1px solid var(--border)' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Percent size={20} /> Global Discount
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
          Set a site-wide discount percentage that applies to <strong>all products</strong>. Set to 0 to disable.
        </p>
        <form action={updateGlobalDiscount} style={{ display: 'flex', gap: '1rem', alignItems: 'end' }}>
          <div style={{ flex: '0 0 200px' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Discount %</label>
            <input type="number" name="discount" min="0" max="100" defaultValue={globalDiscount} className="input-field" required />
          </div>
          <button type="submit" className="btn-primary">
            {globalDiscount > 0 ? 'Update Discount' : 'Set Discount'}
          </button>
          {globalDiscount > 0 && (
            <span style={{ background: '#D4450B', color: '#fff', padding: '0.4rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>
              Currently: {globalDiscount}% OFF on all products
            </span>
          )}
        </form>
      </div>

      {/* Price List Customizer & Upload Section */}
      <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: '0.75rem', marginBottom: '3rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow-glow)' }}>
        <h3 style={{ marginBottom: '0.5rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={20} /> Price List PDF & Table Customizer
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          Upload your price list PDF. Our high-performance extraction engine will read the items, group them, and display them in a searchable table. You can customize every row or add/remove products manually.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          {/* PDF File Uploader */}
          <div style={{ border: '2px dashed var(--border)', borderRadius: '0.5rem', padding: '1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-color)', position: 'relative' }}>
            <Upload size={32} style={{ color: 'var(--primary)', marginBottom: '0.75rem' }} />
            <div style={{ fontWeight: 'bold', fontSize: '0.95rem', marginBottom: '0.25rem' }}>
              {newPdfFile ? newPdfFile.name : 'Upload Price List PDF'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Select a new PDF file to parse and upload
            </div>
            <input 
              type="file" 
              accept="application/pdf" 
              onChange={handlePdfUploadAndParse}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0, cursor: 'pointer' }}
            />
            {priceListPdf && !newPdfFile && (
              <span style={{ background: '#FFEFC0', color: 'var(--text-main)', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <Check size={12} /> Live PDF Saved in DB
              </span>
            )}
            {pdfParsing && (
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.92)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: '0.5rem', zIndex: 10 }}>
                <div style={{ width: '24px', height: '24px', border: '3px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '0.5rem' }}></div>
                <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--primary)' }}>Parsing PDF text...</div>
              </div>
            )}
          </div>

          {/* Quick Statistics & Save */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '0.5rem 0' }}>
            <div>
              <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-main)' }}>Customizer Status</h4>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div>Total Price List Items: <strong style={{ color: 'var(--primary)' }}>{priceListItems.length}</strong></div>
                <div>PDF Linked: <strong>{newPdfFile ? 'New (Pending Save)' : priceListPdf ? 'Yes' : 'No PDF Uploaded'}</strong></div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button 
                type="button" 
                onClick={handleAddRow}
                className="btn-outline" 
                style={{ flex: 1, padding: '0.75rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
              >
                <Plus size={16} /> Add Row
              </button>
              
              <button 
                type="button" 
                onClick={handleSavePriceList}
                disabled={saveLoading}
                className="btn-primary" 
                style={{ flex: 1, padding: '0.75rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
              >
                <Save size={16} /> {saveLoading ? 'Saving...' : 'Save Price List'}
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Spreadsheet Table */}
        <h4 style={{ marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Price List Table Items Preview</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>* Type directly into cells to edit</span>
        </h4>
        
        <div style={{ overflowX: 'auto', maxHeight: '450px', border: '1px solid var(--border)', borderRadius: '0.5rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: 'var(--surface-hover)', borderBottom: '2px solid var(--border)', textAlign: 'left', position: 'sticky', top: 0, zIndex: 1 }}>
                <th style={{ padding: '0.75rem', width: '70px', color: 'var(--primary)' }}>S.No</th>
                <th style={{ padding: '0.75rem', width: '180px', color: 'var(--primary)' }}>Category</th>
                <th style={{ padding: '0.75rem', color: 'var(--primary)' }}>Product Name</th>
                <th style={{ padding: '0.75rem', width: '130px', color: 'var(--primary)' }}>Pack Size</th>
                <th style={{ padding: '0.75rem', width: '110px', color: 'var(--primary)' }}>Price (₹)</th>
                <th style={{ padding: '0.75rem', width: '60px', color: 'var(--primary)' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {priceListItems.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No items in price list. Upload a PDF above or click "Add Row" to start adding cracker pricing manually.
                  </td>
                </tr>
              ) : (
                priceListItems.map((item, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid var(--border)', background: index % 2 === 0 ? 'transparent' : 'rgba(193, 145, 0, 0.02)' }}>
                    <td style={{ padding: '0.5rem' }}>
                      <input 
                        type="text" 
                        value={item.sno} 
                        onChange={(e) => handleCellChange(index, 'sno', e.target.value)}
                        className="input-field" 
                        style={{ padding: '0.35rem 0.5rem', background: 'transparent', textAlign: 'center', border: 'none', boxShadow: 'none' }} 
                      />
                    </td>
                    <td style={{ padding: '0.5rem' }}>
                      <input 
                        type="text" 
                        value={item.category} 
                        onChange={(e) => handleCellChange(index, 'category', e.target.value)}
                        className="input-field" 
                        style={{ padding: '0.35rem 0.5rem', background: 'transparent', border: 'none', boxShadow: 'none' }} 
                      />
                    </td>
                    <td style={{ padding: '0.5rem' }}>
                      <input 
                        type="text" 
                        value={item.name} 
                        onChange={(e) => handleCellChange(index, 'name', e.target.value)}
                        className="input-field" 
                        style={{ padding: '0.35rem 0.5rem', background: 'transparent', border: 'none', boxShadow: 'none', fontWeight: '500' }} 
                      />
                    </td>
                    <td style={{ padding: '0.5rem' }}>
                      <input 
                        type="text" 
                        value={item.pack} 
                        onChange={(e) => handleCellChange(index, 'pack', e.target.value)}
                        className="input-field" 
                        style={{ padding: '0.35rem 0.5rem', background: 'transparent', border: 'none', boxShadow: 'none' }} 
                      />
                    </td>
                    <td style={{ padding: '0.5rem' }}>
                      <input 
                        type="number" 
                        step="0.01"
                        value={item.price} 
                        onChange={(e) => handleCellChange(index, 'price', parseFloat(e.target.value) || 0)}
                        className="input-field" 
                        style={{ padding: '0.35rem 0.5rem', background: 'transparent', border: 'none', boxShadow: 'none', color: 'var(--secondary)', fontWeight: 'bold' }} 
                      />
                    </td>
                    <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                      <button 
                        type="button" 
                        onClick={() => handleDeleteRow(index)}
                        style={{ background: 'transparent', color: 'var(--secondary)', padding: '0.25rem' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manage Products */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Manage Products</h2>
      </div>

      <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '2rem', border: '1px solid var(--border)' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Add New Product</h3>
        <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Name</label>
            <input type="text" name="name" className="input-field" required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Price (₹)</label>
            <input type="number" name="price" step="0.01" className="input-field" required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Stock Qty</label>
            <input type="number" name="stock" min="0" defaultValue="0" className="input-field" required />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Type/Category</label>
            <select name="type" className="input-field" required style={{ background: 'var(--surface-hover)' }}>
              <option value="Sound Crackers">Sound Crackers</option>
              <option value="Sparklers">Sparklers</option>
              <option value="Ground Chakkars">Ground Chakkars</option>
              <option value="Flower Pot">Flower Pot</option>
              <option value="Kids Noveltiles">Kids Noveltiles</option>
              <option value="Fancy">Fancy</option>
              <option value="Sky Shot">Sky Shot</option>
              <option value="Fancy Shower">Fancy Shower</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Image</label>
            <input type="file" name="imageFile" accept="image/*" className="input-field" style={{ padding: '0.5rem' }} />
          </div>
          <button type="submit" disabled={loading} className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <Plus size={18} /> {loading ? 'Adding...' : 'Add'}
          </button>
        </form>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
              <th style={{ padding: '1rem', color: 'var(--primary)' }}>Name</th>
              <th style={{ padding: '1rem', color: 'var(--primary)' }}>Type</th>
              <th style={{ padding: '1rem', color: 'var(--primary)' }}>Price</th>
              <th style={{ padding: '1rem', color: 'var(--primary)' }}>Stock</th>
              <th style={{ padding: '1rem', color: 'var(--primary)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No products found.</td>
              </tr>
            ) : (
              products.map(product => (
                <tr key={product.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem' }}>{product.name}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{product.type}</td>
                  <td style={{ padding: '1rem' }}>₹{product.price.toFixed(2)}</td>
                  <td style={{ padding: '1rem' }}>
                    {product.stock === 0 ? (
                      <span style={{ background: '#DC2626', color: '#fff', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.8rem' }}>Out of Stock</span>
                    ) : product.stock <= 20 ? (
                      <span style={{ background: '#F59E0B', color: '#fff', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.8rem' }}>{product.stock} (Low)</span>
                    ) : (
                      <span>{product.stock}</span>
                    )}
                  </td>
                  <td style={{ padding: '1rem', display: 'flex', gap: '1rem' }}>
                    <button onClick={() => setEditingProduct(product)} style={{ background: 'transparent', color: 'var(--primary)' }}>
                      <Edit size={18} />
                    </button>
                    <form action={deleteProduct}>
                      <input type="hidden" name="id" value={product.id} />
                      <button type="submit" style={{ background: 'transparent', color: 'var(--secondary)' }}>
                        <Trash2 size={18} />
                      </button>
                    </form>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Product Modal */}
      {editingProduct && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'var(--bg-color)', padding: '2rem', borderRadius: '1rem', width: '100%', maxWidth: '500px', position: 'relative', border: '1px solid var(--border)' }}>
            <button onClick={() => setEditingProduct(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent' }}>
              <X size={24} />
            </button>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>Edit Product</h3>
            <form onSubmit={handleEdit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input type="hidden" name="id" value={editingProduct.id} />
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Name</label>
                <input type="text" name="name" defaultValue={editingProduct.name} className="input-field" required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Price (₹)</label>
                <input type="number" name="price" step="0.01" defaultValue={editingProduct.price} className="input-field" required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Stock Qty</label>
                <input type="number" name="stock" min="0" defaultValue={editingProduct.stock} className="input-field" required />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Type/Category</label>
                <select name="type" defaultValue={editingProduct.type} className="input-field" required>
                  <option value="Sound Crackers">Sound Crackers</option>
                  <option value="Sparklers">Sparklers</option>
                  <option value="Ground Chakkars">Ground Chakkars</option>
                  <option value="Flower Pot">Flower Pot</option>
                  <option value="Kids Noveltiles">Kids Noveltiles</option>
                  <option value="Fancy">Fancy</option>
                  <option value="Sky Shot">Sky Shot</option>
                  <option value="Fancy Shower">Fancy Shower</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem' }}>New Image (Optional)</label>
                <input type="file" name="imageFile" accept="image/*" className="input-field" style={{ padding: '0.5rem' }} />
              </div>
              <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: '1rem' }}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
