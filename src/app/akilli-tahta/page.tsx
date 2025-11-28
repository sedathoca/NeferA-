'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import jsQR from 'jsqr';
import {
    BookOpen, Brush, Clock, Download, Upload, Home, Moon, Sun, Library,
    ChevronLeft, ChevronRight, Search, Maximize, QrCode, Mic,
    ALargeSmall, Minus, Plus, Trash2, Settings, Palette, Eraser, MousePointer,
    Users, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import * as pdfjsLib from 'pdfjs-dist';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import * as XLSX from 'xlsx';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// PDF.js worker'ını Next.js için doğru şekilde ayarlama
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.js`;
}

const Toolbar = ({ onPageChange, currentPage, pageCount, drawingState, setDrawingState, openStudentListModal, openLuckyModal, toggleRecording, isRecording, zoom, setZoom } : any) => (
    <div className="m-2 p-2 bg-background/80 backdrop-blur-sm border rounded-lg flex gap-2 items-center shadow-sm flex-wrap no-print">
        <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" title="Önceki Sayfa" onClick={() => onPageChange('prev')} disabled={currentPage <= 1}><ChevronLeft /></Button>
            <input type="number" value={currentPage} onChange={(e) => onPageChange(e.target.value)} className="w-16 h-10 text-center border rounded-md bg-background" />
            <span className="text-sm text-muted-foreground px-1">/ {pageCount || '--'}</span>
            <Button variant="outline" size="icon" title="Sonraki Sayfa" onClick={() => onPageChange('next')} disabled={currentPage >= pageCount}><ChevronRight /></Button>
        </div>
         <div className="flex items-center gap-1 border-l pl-2">
            <Button variant={drawingState.mode === 'view' ? 'secondary' : 'outline'} size="icon" title="Gezinme" onClick={() => setDrawingState((s:any) => ({...s, mode: 'view'}))}><MousePointer /></Button>
            <Button variant={drawingState.mode === 'draw' ? 'secondary' : 'outline'} size="icon" title="Çizim" onClick={() => setDrawingState((s:any) => ({...s, mode: 'draw'}))}><Brush /></Button>
            <Button variant={drawingState.mode === 'focus' ? 'secondary' : 'outline'} size="icon" title="Odakla" onClick={() => setDrawingState((s:any) => ({...s, mode: 'focus'}))}><Maximize /></Button>
            <Button variant={drawingState.mode === 'qr' ? 'secondary' : 'outline'} size="icon" title="Karekod Seç" onClick={() => setDrawingState((s:any) => ({...s, mode: 'qr'}))}><QrCode /></Button>
        </div>
        <div className="flex items-center gap-1 border-l pl-2">
            <Button variant="outline" size="icon" title="Küçült" onClick={() => setZoom((z: number) => Math.max(0.2, z - 0.1))}><Minus /></Button>
            <span className='text-sm font-semibold w-12 text-center'>{Math.round(zoom * 100)}%</span>
            <Button variant="outline" size="icon" title="Büyüt" onClick={() => setZoom((z: number) => Math.min(3, z + 0.1))}><Plus /></Button>
        </div>
        <div className="flex items-center gap-1 border-l pl-2">
            <input type="color" value={drawingState.color} onChange={(e) => setDrawingState((s:any) => ({...s, color: e.target.value}))} className="w-8 h-8 rounded-md border" />
            <Button variant={drawingState.size === 2 ? 'secondary' : 'outline'} size="icon" title="İnce" onClick={() => setDrawingState((s:any) => ({...s, size: 2}))}><Minus /></Button>
            <Button variant={drawingState.size === 5 ? 'secondary' : 'outline'} size="icon" title="Kalın" onClick={() => setDrawingState((s:any) => ({...s, size: 5}))}><Plus /></Button>
            <Button variant={drawingState.tool === 'eraser' ? 'secondary' : 'outline'} size="icon" title="Silgi" onClick={() => setDrawingState((s:any) => ({...s, tool: 'eraser'}))}><Eraser /></Button>
            <Button variant="outline" size="icon" title="Temizle" onClick={() => {
                
            }}><Trash2 /></Button>
        </div>
         <div className="flex items-center gap-1 border-l pl-2">
             <Button variant="outline" size="icon" title="Liste" onClick={openStudentListModal}>📋</Button>
             <Button variant="outline" size="icon" title="Kura" onClick={openLuckyModal}>🎲</Button>
        </div>
        <div className="flex items-center gap-1 border-l pl-2">
             <Button variant={isRecording ? 'destructive' : 'outline'} size="sm" className="h-10" onClick={toggleRecording}>
                <Mic className="mr-2"/> {isRecording ? 'Durdur' : 'Kayıt'}
             </Button>
        </div>
         <div className="flex items-center gap-1 border-l pl-2">
             <Button asChild variant="outline" className="h-10">
                <Link href="/">
                    <Home className="mr-2 h-4 w-4" /> Ana Menü
                </Link>
            </Button>
        </div>
    </div>
);

const FocusModeOverlay = ({ image, onClose }: { image: HTMLCanvasElement | null, onClose: () => void }) => {
    const drawCanvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        if (!image || !drawCanvasRef.current || !imageRef.current) return;
        
        const canvas = drawCanvasRef.current;
        const context = canvas.getContext('2d');
        if (!context) return;
        
        canvas.width = image.width;
        canvas.height = image.height;
        
        let isDrawing = false;
        
        const getPos = (e: MouseEvent | TouchEvent) => {
            const canvasElem = drawCanvasRef.current!;
            const imageElem = imageRef.current!;
            const imageDisplayRect = imageElem.getBoundingClientRect();

            const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
            const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

            const mouseX = clientX - imageDisplayRect.left;
            const mouseY = clientY - imageDisplayRect.top;

            const scaleX = canvasElem.width / imageDisplayRect.width;
            const scaleY = canvasElem.height / imageDisplayRect.height;
            
            return {
                x: mouseX * scaleX,
                y: mouseY * scaleY
            };
        };

        const startDrawing = (e: MouseEvent | TouchEvent) => {
            e.preventDefault();
            isDrawing = true;
            const pos = getPos(e);
            context.beginPath();
            context.moveTo(pos.x, pos.y);
        };

        const draw = (e: MouseEvent | TouchEvent) => {
            e.preventDefault();
            if (!isDrawing) return;
            const pos = getPos(e);
            context.lineWidth = 5;
            context.strokeStyle = 'red';
            context.lineCap = 'round';
            context.lineTo(pos.x, pos.y);
            context.stroke();
        };

        const stopDrawing = () => {
            if (!isDrawing) return;
            isDrawing = false;
            context.beginPath();
        };

        const canvasParent = canvas.parentElement!;
        canvasParent.addEventListener('mousedown', startDrawing);
        canvasParent.addEventListener('mousemove', draw);
        canvasParent.addEventListener('mouseup', stopDrawing);
        canvasParent.addEventListener('mouseleave', stopDrawing);
        
        canvasParent.addEventListener('touchstart', startDrawing);
        canvasParent.addEventListener('touchmove', draw);
        canvasParent.addEventListener('touchend', stopDrawing);


        return () => {
            canvasParent.removeEventListener('mousedown', startDrawing);
            canvasParent.removeEventListener('mousemove', draw);
            canvasParent.removeEventListener('mouseup', stopDrawing);
            canvasParent.removeEventListener('mouseleave', stopDrawing);
            
            canvasParent.removeEventListener('touchstart', startDrawing);
            canvasParent.removeEventListener('touchmove', draw);
            canvasParent.removeEventListener('touchend', stopDrawing);
        };
    }, [image]);

    const clearFocusDrawings = () => {
        const ctx = drawCanvasRef.current?.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }

    if (!image) return null;

    return (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-lg z-50 flex flex-col no-print">
            <div className="p-2 bg-background border-b flex justify-between items-center">
                <p className="font-bold text-lg">Odak Modu</p>
                <div>
                     <Button variant="destructive" onClick={clearFocusDrawings}>
                        <Trash2 className="mr-2" /> Temizle
                    </Button>
                    <Button variant="outline" onClick={onClose} className="ml-2">
                       <X className="mr-2"/> Kapat
                    </Button>
                </div>
            </div>
            <div className="flex-1 flex items-center justify-center p-1">
                 <div className="relative shadow-2xl h-4/6 w-auto">
                    <img ref={imageRef} src={image.toDataURL()} alt="Odaklanmış alan" className="object-contain h-full w-full" />
                    <canvas ref={drawCanvasRef} className="absolute top-0 left-0 w-full h-full" />
                </div>
            </div>
        </div>
    );
};


export default function AkilliTahtaPage() {
    const [pdfState, setPdfState] = useState<{ pdf: any; currentPage: number; pageCount: number; drawings: { [key: number]: string }; }>({ pdf: null, currentPage: 1, pageCount: 0, drawings: {} });
    const renderTask = useRef<any>(null);
    const pdfCanvasRef = useRef<HTMLCanvasElement>(null);
    const drawCanvasRef = useRef<HTMLCanvasElement>(null);
    const canvasContainerRef = useRef<HTMLDivElement>(null);
    const interactionDivRef = useRef<HTMLDivElement>(null);
    
    const [drawingState, setDrawingState] = useState({ mode: 'view', tool: 'pen', color: '#ff0000', size: 2 });
    const [isDrawing, setIsDrawing] = useState(false);
    const [isSelecting, setIsSelecting] = useState(false);
    const [selectionRect, setSelectionRect] = useState<React.CSSProperties>({});
    const lastPos = useRef({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);

    const [focusedImage, setFocusedImage] = useState<HTMLCanvasElement | null>(null);

    const [students, setStudents] = useState<any[]>([]);
    const [isStudentListModalOpen, setIsStudentListModalOpen] = useState(false);
    const [isLuckyModalOpen, setIsLuckyModalOpen] = useState(false);
    const [luckyResult, setLuckyResult] = useState("Hazır...");
    const excelInputRef = useRef<HTMLInputElement>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const [isRecording, setIsRecording] = useState(false);

    useEffect(() => {
        try {
            const storedStudents = localStorage.getItem('studentData');
            if (storedStudents) {
                setStudents(JSON.parse(storedStudents));
            }
        } catch (error) {
            console.error("Öğrenci Listesi Yüklenemedi", "Kaydedilmiş öğrenci listesi okunurken bir hata oluştu.");
        }
    }, []);
    

    const loadDrawing = useCallback((pageNum: number) => {
        const drawCtx = drawCanvasRef.current?.getContext('2d');
        if (!drawCtx || !drawCanvasRef.current) return;
        
        drawCtx.clearRect(0, 0, drawCanvasRef.current.width, drawCanvasRef.current.height);

        const savedDrawing = pdfState.drawings[pageNum];
        if (savedDrawing) {
            const img = new Image();
            img.onload = () => {
                drawCtx.drawImage(img, 0, 0);
            };
            img.src = savedDrawing;
        }
    }, [pdfState.drawings]);

    const renderPage = useCallback(async (pageNum: number, pdfToRender: any, currentZoom: number) => {
        if (!pdfToRender || !pdfCanvasRef.current || !interactionDivRef.current) return;

        if (renderTask.current) {
            renderTask.current.cancel();
        }

        try {
            const page = await pdfToRender.getPage(pageNum);
            const container = canvasContainerRef.current;
            if (!container) return;

            const viewportOptions = { scale: 1 };
            const initialViewport = page.getViewport(viewportOptions);
            
            const scale = (container.clientWidth / initialViewport.width) * currentZoom;
            const viewport = page.getViewport({ scale });

            const pdfCanvas = pdfCanvasRef.current;
            const drawCanvas = drawCanvasRef.current;
            const pdfContext = pdfCanvas.getContext('2d');

            if (!pdfContext || !drawCanvas) return;
            
            pdfCanvas.height = viewport.height;
            pdfCanvas.width = viewport.width;
            drawCanvas.height = viewport.height;
            drawCanvas.width = viewport.width;
            
            interactionDivRef.current.style.height = `${viewport.height}px`;
            interactionDivRef.current.style.width = `${viewport.width}px`;
            
            const newRenderTask = page.render({ canvasContext: pdfContext, viewport });
            renderTask.current = newRenderTask;

            await newRenderTask.promise;
            
            renderTask.current = null;
            loadDrawing(pageNum);

        } catch (error: any) {
            if (error.name !== 'RenderingCancelledException') {
                console.error('Sayfa render hatası:', error);
            }
        }
    }, [loadDrawing]);
    
    useEffect(() => {
        if (pdfState.pdf && pdfState.currentPage) {
            renderPage(pdfState.currentPage, pdfState.pdf, zoom);
        }

        const handleResize = () => {
             if (pdfState.pdf && pdfState.currentPage) {
                renderPage(pdfState.currentPage, pdfState.pdf, zoom);
            }
        }
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [pdfState.pdf, pdfState.currentPage, renderPage, zoom]);
    

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type === 'application/pdf') {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const data = e.target?.result;
                if (data instanceof ArrayBuffer) {
                    try {
                        const loadingTask = pdfjsLib.getDocument({ data });
                        const loadedPdf = await loadingTask.promise;
                        setPdfState({
                            pdf: loadedPdf,
                            currentPage: 1,
                            pageCount: loadedPdf.numPages,
                            drawings: {}
                        });
                        console.log(`${file.name} yüklendi.`);
                    } catch (error) {
                       console.error('PDF dosyası yüklenemedi.');
                    }
                }
            };
            reader.readAsArrayBuffer(file);
        } else {
             console.error('Lütfen bir PDF dosyası seçin.');
        }
    };

    const saveDrawing = useCallback(() => {
        if (!drawCanvasRef.current) return;
        const dataUrl = drawCanvasRef.current.toDataURL();
        setPdfState(s => ({
            ...s,
            drawings: { ...s.drawings, [s.currentPage]: dataUrl }
        }));
    }, []);

    const handlePageChange = useCallback((action: 'prev' | 'next' | string) => {
        saveDrawing();
        setPdfState(prevState => {
            let newPageNum = prevState.currentPage;
            if (action === 'prev') {
                newPageNum = Math.max(1, prevState.currentPage - 1);
            } else if (action === 'next') {
                newPageNum = Math.min(prevState.pageCount, prevState.currentPage + 1);
            } else if (!isNaN(parseInt(action))) {
                const num = parseInt(action);
                if (num >= 1 && num <= prevState.pageCount) {
                    newPageNum = num;
                }
            }
            if (newPageNum !== prevState.currentPage) {
                return { ...prevState, currentPage: newPageNum };
            }
            return prevState;
        });
    }, [saveDrawing]);
    
    const getPos = useCallback((e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        if (!drawCanvasRef.current) return { x: 0, y: 0 };
        const rect = drawCanvasRef.current.getBoundingClientRect();
        
        if ('touches' in e) {
            return {
                x: e.touches[0].clientX - rect.left,
                y: e.touches[0].clientY - rect.top,
            };
        }
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    }, []);

    const startInteraction = useCallback((e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        const { mode } = drawingState;
        e.preventDefault();
        
        const pos = getPos(e as any);
        lastPos.current = pos;
        
        if (mode === 'draw') {
             setIsDrawing(true);
        } else if (mode === 'focus' || mode === 'qr') {
             setIsSelecting(true);
             setSelectionRect({
                left: lastPos.current.x,
                top: lastPos.current.y,
                width: 0,
                height: 0,
            });
        }
    }, [drawingState, getPos]);

    const handleInteraction = useCallback((e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        const { mode, tool, color, size } = drawingState;
        e.preventDefault();
        const pos = getPos(e as any);

        if (mode === 'draw' && isDrawing) {
            const ctx = drawCanvasRef.current?.getContext('2d');
            if (!ctx) return;
            ctx.beginPath();
            ctx.moveTo(lastPos.current.x, lastPos.current.y);
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            
            if (tool === 'eraser') {
                ctx.globalCompositeOperation = 'destination-out';
                ctx.lineWidth = 20; // Eraser size
            } else {
                ctx.globalCompositeOperation = 'source-over';
                ctx.strokeStyle = color;
                ctx.lineWidth = size;
            }
            
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();
            lastPos.current = pos;
        } else if ((mode === 'focus' || mode === 'qr') && isSelecting) {
            const newWidth = pos.x - lastPos.current.x;
            const newHeight = pos.y - lastPos.current.y;
            setSelectionRect({
                left: newWidth > 0 ? lastPos.current.x : pos.x,
                top: newHeight > 0 ? lastPos.current.y : pos.y,
                width: Math.abs(newWidth),
                height: Math.abs(newHeight),
            });
        }
    }, [drawingState, getPos, isDrawing, isSelecting]);
    
    const captureSelection = useCallback((x: number, y: number, w: number, h: number) => {
        const pdfCanvas = pdfCanvasRef.current;
        const drawCanvas = drawCanvasRef.current;
        if (!pdfCanvas || !drawCanvas || w <= 0 || h <= 0) return null;

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = w;
        tempCanvas.height = h;
        const tempCtx = tempCanvas.getContext('2d');
        if (tempCtx) {
            tempCtx.drawImage(pdfCanvas, x, y, w, h, 0, 0, w, h);
            tempCtx.drawImage(drawCanvas, x, y, w, h, 0, 0, w, h);
        }
        return tempCanvas;
    }, []);

    const stopInteraction = useCallback(() => {
        if (isDrawing) {
            setIsDrawing(false);
            saveDrawing();
        }
        if (isSelecting) {
            setIsSelecting(false);
            const { left, top, width, height } = selectionRect;
            setSelectionRect({}); // Clear selection rect immediately

            if (typeof left !== 'number' || typeof top !== 'number' || typeof width !== 'number' || typeof height !== 'number' || width <= 20 || height <= 20) {
                 setDrawingState(s => ({...s, mode: 'view'}));
                return;
            }
            
            const capturedCanvas = captureSelection(left, top, width, height);
            
            if (drawingState.mode === 'focus') {
                if (capturedCanvas) {
                    setFocusedImage(capturedCanvas);
                }
            } else if (drawingState.mode === 'qr') {
                if (capturedCanvas) {
                    const ctx = capturedCanvas.getContext('2d');
                    if (ctx) {
                        const imageData = ctx.getImageData(0, 0, capturedCanvas.width, capturedCanvas.height);
                        const code = jsQR(imageData.data, imageData.width, imageData.height);
                        if (code) {
                            alert(`Karekod Okundu:\n\n${code.data}`);
                        } else {
                            alert("Seçili alanda karekod bulunamadı.");
                        }
                    }
                }
            }
            // Always reset mode to view after an interaction
            setDrawingState(s => ({...s, mode: 'view'}));
        }
    }, [isDrawing, isSelecting, selectionRect, saveDrawing, captureSelection, drawingState.mode]);


    const handleExcelUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                const parsedStudents = jsonData
                    .slice(1) // Skip header row
                    .map(row => ({ no: row[0], ad: row[1], soyad: row[2] || '' }))
                    .filter(s => s.no && s.ad);
                
                if (parsedStudents.length > 0) {
                    setStudents(parsedStudents);
                    localStorage.setItem('studentData', JSON.stringify(parsedStudents));
                    console.log('Başarılı', `${parsedStudents.length} öğrenci yüklendi.`);
                    setIsStudentListModalOpen(false);
                } else {
                    console.error('Hata', 'Excel dosyasında geçerli öğrenci verisi bulunamadı.');
                }

            } catch (error) {
                console.error('Hata', 'Excel dosyası okunurken bir hata oluştu.');
            }
        };
        reader.readAsArrayBuffer(file);
        if (event.target) {
            event.target.value = '';
        }
    };

    const pickLuckyStudent = () => {
        if (students.length === 0) {
            setLuckyResult("Öğrenci listesi boş!");
            return;
        }

        let count = 0;
        const interval = setInterval(() => {
            const randomIndex = Math.floor(Math.random() * students.length);
            const randomStudent = students[randomIndex];
            setLuckyResult(`${randomStudent.no} ${randomStudent.ad}`);
            count++;
            if (count > 20) {
                clearInterval(interval);
            }
        }, 80);
    };

     const toggleRecording = async () => {
        if (isRecording) {
            mediaRecorderRef.current?.stop();
            setIsRecording(false);
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorderRef.current = new MediaRecorder(stream);
                mediaRecorderRef.current.start();
                mediaRecorderRef.current.ondataavailable = (event) => {
                    // Kaydedilen veriyi işleme (örneğin indirme veya sunucuya gönderme)
                    console.log("Kayıt verisi mevcut:", event.data);
                };
                 mediaRecorderRef.current.onstop = () => {
                    stream.getTracks().forEach(track => track.stop());
                };
                setIsRecording(true);
                console.log('Kayıt Başladı', 'Ders kaydı alınıyor.');
            } catch (error) {
                console.error('Hata', 'Mikrofon erişimi reddedildi veya bulunamadı.');
            }
        }
    };


    return (
        <div className="h-screen bg-background text-foreground flex flex-col">
            <main className="flex-1 flex flex-col">
                <Toolbar 
                    onPageChange={handlePageChange}
                    currentPage={pdfState.currentPage}
                    pageCount={pdfState.pageCount}
                    drawingState={drawingState}
                    setDrawingState={setDrawingState}
                    openStudentListModal={() => setIsStudentListModalOpen(true)}
                    openLuckyModal={() => { setLuckyResult("Hazır..."); setIsLuckyModalOpen(true); }}
                    isRecording={isRecording}
                    toggleRecording={toggleRecording}
                    zoom={zoom}
                    setZoom={setZoom}
                />
                <div
                    ref={canvasContainerRef}
                    className={cn("flex-1 bg-gray-800 flex overflow-auto w-full h-full justify-center items-start p-4")}
                    onMouseUp={stopInteraction}
                    onMouseLeave={stopInteraction}
                    onTouchEnd={stopInteraction}
                >
                    {pdfState.pdf === null ? (
                        <div className="w-full h-full flex flex-col items-center justify-center text-white">
                           <Library className="w-24 h-24 text-muted-foreground/50 mb-4"/>
                           <h2 className="text-2xl font-bold mb-2">Başlamak için bir PDF dosyası seçin</h2>
                            <p className="text-muted-foreground mb-4">Aşağıdaki butonu kullanarak bir ders kitabı veya sunum yükleyin.</p>
                             <label className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 cursor-pointer">
                                PDF Yükle
                                <input type="file" accept=".pdf" onChange={handleFileSelect} className="hidden" />
                            </label>
                        </div>
                    ) : (
                    <div ref={interactionDivRef} className="relative bg-white shadow-lg"
                        onMouseDown={startInteraction}
                        onMouseMove={handleInteraction}
                        onTouchStart={startInteraction}
                        onTouchMove={handleInteraction}
                    >
                        <canvas ref={pdfCanvasRef} className="block"></canvas>
                        <canvas id="draw-canvas" ref={drawCanvasRef} className="absolute top-0 left-0" />
                        {isSelecting && <div style={selectionRect} className={cn("absolute border-2 border-dashed pointer-events-none", drawingState.mode === 'qr' ? 'border-green-500 bg-green-500/20' : 'border-primary bg-primary/20')} />}
                    </div>
                    )}
                </div>
            </main>

            {focusedImage && (
                <FocusModeOverlay 
                    image={focusedImage} 
                    onClose={() => setFocusedImage(null)} 
                />
            )}

            {/* Student List Modal */}
            <Dialog open={isStudentListModalOpen} onOpenChange={setIsStudentListModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Sınıf Listesi Yönetimi</DialogTitle>
                        <DialogDescription>
                            Öğrenci listenizi Excel formatında yükleyin. Excel dosyanızın ilk satırı başlık olmalı ve sırasıyla A sütununda numara, B sütununda ad olmalıdır.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Button onClick={() => excelInputRef.current?.click()} className="w-full">
                            <Users className="mr-2" /> Excel'den Öğrenci Yükle
                        </Button>
                        <input
                            type="file"
                            ref={excelInputRef}
                            onChange={handleExcelUpload}
                            className="hidden"
                            accept=".xlsx, .xls"
                        />
                    </div>
                    <DialogFooter>
                        <p className="text-sm text-muted-foreground">{students.length} öğrenci yüklü.</p>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Lucky Student Modal */}
            <Dialog open={isLuckyModalOpen} onOpenChange={setIsLuckyModalOpen}>
                <DialogContent className="text-center">
                    <DialogHeader>
                        <DialogTitle className="text-center">🎲 Şanslı Öğrenci</DialogTitle>
                    </DialogHeader>
                    <div className="py-8">
                        <div className="text-4xl font-bold text-primary p-8 border-2 border-dashed border-primary rounded-lg">
                            {luckyResult}
                        </div>
                    </div>
                    <DialogFooter className="flex-col items-center sm:justify-center">
                        <Button onClick={pickLuckyStudent} size="lg">🎯 SEÇ</Button>
                        <p className="text-sm text-muted-foreground mt-2">{students.length} öğrenci arasından.</p>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
