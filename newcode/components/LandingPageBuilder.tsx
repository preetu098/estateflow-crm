
import React, { useState } from 'react';
import { LandingPage, LandingPageBlock } from '../types';
import { MOCK_LANDING_PAGES } from '../constants';
import { Globe, Plus, Image, Type, Youtube, LayoutTemplate, Save, Eye, ExternalLink, Trash2, MoveVertical } from 'lucide-react';

const LandingPageBuilder: React.FC = () => {
    const [pages, setPages] = useState<LandingPage[]>(MOCK_LANDING_PAGES);
    const [selectedPage, setSelectedPage] = useState<LandingPage | null>(null);
    const [view, setView] = useState<'list' | 'editor'>('list');

    const handleCreatePage = () => {
        const newPage: LandingPage = {
            id: `lp-${Date.now()}`,
            title: 'New Campaign Page',
            slug: 'new-offer',
            status: 'Draft',
            blocks: [],
            leadsGenerated: 0
        };
        setPages([...pages, newPage]);
        setSelectedPage(newPage);
        setView('editor');
    };

    const addBlock = (type: LandingPageBlock['type']) => {
        if(!selectedPage) return;
        const newBlock: LandingPageBlock = {
            id: `blk-${Date.now()}`,
            type,
            content: {}
        };
        const updatedPage = { ...selectedPage, blocks: [...selectedPage.blocks, newBlock] };
        setSelectedPage(updatedPage);
        // Update in list
        setPages(prev => prev.map(p => p.id === updatedPage.id ? updatedPage : p));
    };

    const deleteBlock = (blockId: string) => {
        if(!selectedPage) return;
        const updatedPage = { ...selectedPage, blocks: selectedPage.blocks.filter(b => b.id !== blockId) };
        setSelectedPage(updatedPage);
        setPages(prev => prev.map(p => p.id === updatedPage.id ? updatedPage : p));
    };

    return (
        <div className="h-full bg-slate-50 flex flex-col animate-fade-in">
            {view === 'list' ? (
                <div className="p-8">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                                <Globe className="w-8 h-8 text-blue-600" /> Landing Pages
                            </h1>
                            <p className="text-slate-500">Create high-converting pages without coding.</p>
                        </div>
                        <button onClick={handleCreatePage} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold shadow-md hover:bg-blue-700 flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Create Page
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {pages.map(page => (
                            <div key={page.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                                        <LayoutTemplate className="w-6 h-6" />
                                    </div>
                                    <span className={`text-xs font-bold px-2 py-1 rounded ${page.status === 'Published' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                        {page.status}
                                    </span>
                                </div>
                                <h3 className="font-bold text-lg text-slate-800 mb-1">{page.title}</h3>
                                <p className="text-xs text-slate-400 font-mono mb-4">/{page.slug}</p>
                                <div className="flex justify-between items-center text-sm border-t border-slate-50 pt-4">
                                    <span className="text-slate-500 font-bold">{page.leadsGenerated} Leads</span>
                                    <button onClick={() => { setSelectedPage(page); setView('editor'); }} className="text-blue-600 font-bold hover:underline">Edit</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="flex h-full">
                    {/* Left: Controls */}
                    <div className="w-80 bg-white border-r border-slate-200 flex flex-col">
                        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
                            <button onClick={() => setView('list')} className="p-2 hover:bg-slate-100 rounded">Back</button>
                            <h3 className="font-bold text-slate-700">Editor</h3>
                        </div>
                        
                        <div className="p-4 space-y-6 overflow-y-auto flex-1">
                            {/* Page Settings */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-slate-500 uppercase">Page Settings</label>
                                <input 
                                    type="text" 
                                    value={selectedPage?.title} 
                                    onChange={(e) => setSelectedPage(prev => prev ? ({...prev, title: e.target.value}) : null)}
                                    className="w-full p-2 border border-slate-300 rounded text-sm" 
                                    placeholder="Page Title"
                                />
                                <input 
                                    type="text" 
                                    value={selectedPage?.slug} 
                                    onChange={(e) => setSelectedPage(prev => prev ? ({...prev, slug: e.target.value}) : null)}
                                    className="w-full p-2 border border-slate-300 rounded text-sm" 
                                    placeholder="URL Slug"
                                />
                            </div>

                            {/* Blocks Palette */}
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-3 block">Add Blocks</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button onClick={() => addBlock('Hero')} className="p-3 border border-slate-200 rounded hover:bg-slate-50 flex flex-col items-center gap-1 text-xs font-bold text-slate-600">
                                        <Image className="w-5 h-5 text-blue-500" /> Hero
                                    </button>
                                    <button onClick={() => addBlock('Text')} className="p-3 border border-slate-200 rounded hover:bg-slate-50 flex flex-col items-center gap-1 text-xs font-bold text-slate-600">
                                        <Type className="w-5 h-5 text-slate-500" /> Text
                                    </button>
                                    <button onClick={() => addBlock('Video')} className="p-3 border border-slate-200 rounded hover:bg-slate-50 flex flex-col items-center gap-1 text-xs font-bold text-slate-600">
                                        <Youtube className="w-5 h-5 text-red-500" /> Video
                                    </button>
                                    <button onClick={() => addBlock('Form')} className="p-3 border border-slate-200 rounded hover:bg-slate-50 flex flex-col items-center gap-1 text-xs font-bold text-slate-600">
                                        <LayoutTemplate className="w-5 h-5 text-green-500" /> Form
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t border-slate-100 bg-slate-50">
                            <button onClick={() => alert("Page Published!")} className="w-full py-3 bg-green-600 text-white font-bold rounded-lg shadow hover:bg-green-700">
                                Publish Page
                            </button>
                        </div>
                    </div>

                    {/* Right: Preview Canvas */}
                    <div className="flex-1 bg-slate-100 p-8 overflow-y-auto flex justify-center">
                        <div className="w-[375px] min-h-[667px] bg-white shadow-2xl border-8 border-slate-800 rounded-[3rem] overflow-hidden relative">
                            {/* Phone Notch */}
                            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-xl z-20"></div>
                            
                            <div className="h-full overflow-y-auto bg-white pt-8 pb-8">
                                {selectedPage?.blocks.length === 0 && (
                                    <div className="h-full flex items-center justify-center text-slate-300 text-sm p-8 text-center">
                                        Add blocks from the left to build your page.
                                    </div>
                                )}
                                
                                {selectedPage?.blocks.map((block, idx) => (
                                    <div key={block.id} className="relative group hover:ring-2 ring-blue-500/50 transition">
                                        <button onClick={() => deleteBlock(block.id)} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition z-10">
                                            <Trash2 className="w-3 h-3" />
                                        </button>

                                        {block.type === 'Hero' && (
                                            <div className="h-48 bg-slate-200 flex items-center justify-center text-slate-400 relative">
                                                <Image className="w-12 h-12" />
                                                <div className="absolute bottom-4 left-4 right-4 text-white font-bold text-xl drop-shadow-md">Hero Headline</div>
                                            </div>
                                        )}
                                        {block.type === 'Text' && (
                                            <div className="p-6 text-slate-600 text-sm leading-relaxed">
                                                <h3 className="font-bold text-slate-800 mb-2 text-lg">Why Choose Us?</h3>
                                                <p>Premium amenities, prime location, and best-in-class construction quality.</p>
                                            </div>
                                        )}
                                        {block.type === 'Video' && (
                                            <div className="aspect-video bg-black flex items-center justify-center text-white">
                                                <Youtube className="w-12 h-12" />
                                            </div>
                                        )}
                                        {block.type === 'Form' && (
                                            <div className="p-6 bg-blue-50 m-4 rounded-xl border border-blue-100">
                                                <h4 className="font-bold text-blue-800 mb-3">Enquire Now</h4>
                                                <input disabled type="text" placeholder="Name" className="w-full mb-2 p-2 text-xs border rounded" />
                                                <input disabled type="text" placeholder="Mobile" className="w-full mb-2 p-2 text-xs border rounded" />
                                                <button className="w-full bg-blue-600 text-white py-2 rounded text-xs font-bold">Submit</button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LandingPageBuilder;
