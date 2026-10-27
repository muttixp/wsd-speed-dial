import numpy as np, sys
from PIL import Image
W,H=2560,1440
y,x=np.mgrid[0:H,0:W].astype(np.float32)
def sstep(e0,e1,v):
    t=np.clip((v-e0)/(e1-e0),0,1); return t*t*(3-2*t)
def renk(h): return np.array([int(h[i:i+2],16) for i in (1,3,5)],np.float32)/255
def yatay(pal,s):
    pal=np.array([renk(p) for p in pal]); s=np.clip(s,0,1)
    idx=s*(len(pal)-1); i0=np.floor(idx).astype(int); i1=np.minimum(i0+1,len(pal)-1); w=(idx-i0)[...,None]
    return pal[i0]*(1-w)+pal[i1]*w
def ciz(ad, zemin, pal, golgeR, beyaz, beyazOran, golgeG, rimG, n=8):
    c=np.ones((H,W,3),np.float32)*renk(zemin)
    # hafif zemin isigi
    s=x/W*0.85+y/H*0.25
    gr=renk(golgeR)
    olc=min(W,H)
    for i in range(n):
        u=i/(n-1)
        cx,cy=W*(0.50+0.32*u), H*(1.10+0.22*u)
        a,b=W*(0.74-0.30*u), H*(0.98-0.42*u)
        th=np.deg2rad(-8-6*u)
        dx=(x-cx)/a; dy=(y-cy)/b
        rx=dx*np.cos(th)-dy*np.sin(th); ry=dx*np.sin(th)+dy*np.cos(th)
        p=2.3+0.4*u
        g=(np.abs(rx)**p+np.abs(ry)**p)**(1/p)
        g=g+0.012*np.sin(rx*3.1+i*1.7)          # hafif dalgalanma
        d=(g-1)*min(a,b)                          # >0 disarida, piksel cinsinden yaklasik
        # 1) bu yaprak alttakine yumusak golge birakir (disari dogru)
        golge=np.exp(-np.clip(d,0,None)/ (olc*0.045)) * (d>0) * golgeG
        golge=golge*sstep(-2,3,d)
        c=c*(1-golge[...,None])+gr*golge[...,None]
        # 2) yaprak rengi: yatay pastel, kenara yakin daha beyaz
        ic=np.clip(-d/(olc*0.10),0,1)             # kenardan iceri 0..1
        taban=yatay(pal, s+u*0.06-0.04)
        beyazlik=beyazOran*(1-ic*0.6)
        yr=taban*(1-beyazlik[...,None])+renk(beyaz)*beyazlik[...,None]
        # ic tarafa dogru hafif koyulasma (derinlik)
        yr=yr*(1-0.10*ic[...,None])
        m=sstep(0.8,-0.8,d)                        # icerisi 1, kenar yumusak
        c=c*(1-m[...,None])+yr*m[...,None]
        # 3) ince parlak kenar
        rim=np.exp(-((d+1.2)/1.4)**2)*rimG
        c=c+(1-c)*rim[...,None]
    img=Image.fromarray((np.clip(c,0,1)*255+0.5).astype(np.uint8))
    img.save(ad+'.png'); img.resize((1280,720),Image.LANCZOS).save(ad+'-k.png')
ciz('z-acik','#f6f8fc',['#f6b8d4','#c9b8ef','#8fb0ec','#a9c4f3','#c7d6f6','#d9cdf1'],'#4d6fc0','#ffffff',0.36,0.28,0.9)
ciz('z-koyu','#090c17',['#6b2d5c','#3d3a8c','#1f4a99','#2b5aa8','#36508f','#4a3d86'],'#000000','#9fb7ff',0.10,0.55,0.35)
