import numpy as np
from PIL import Image
W,H=2560,1440
rng=np.random.default_rng(7)
y,x=np.mgrid[0:H,0:W].astype(np.float32)
u=x/W; v=y/H
def renk(h): return np.array([int(h[i:i+2],16) for i in (1,3,5)],np.float32)/255
def ciz(ad, zemin, lekeler, ipek, ipekG, golgeK=0.35, golgeR=None):
    c=np.ones((H,W,3),np.float32)*renk(zemin)
    # yumusak renk lekeleri (mesh)
    for (cx,cy,rx,ry,r,g) in lekeler:
        d=((u-cx)/rx)**2+((v-cy)/ry)**2
        a=np.exp(-d*1.6)*g
        c=c*(1-a[...,None])+renk(r)*a[...,None]
    # ipek kivrimlari: capraz akan, yumusak isik/golge bantlari
    t=(u*0.9+v*0.55)
    for k,(faz,gen,gu) in enumerate([(0.0,9.0,1.0),(1.7,13.0,0.6)]):
        dal=np.sin((t+0.06*np.sin(u*5+k))*gen*np.pi+faz)
        maske=np.exp(-((v-(0.62-0.35*u+0.08*k))/0.22)**2)   # bant capraz bir seritte
        isik=np.clip(dal,0,1)**3*maske*ipekG*gu
        golge=np.clip(-dal,0,1)**2*maske*ipekG*0.5*gu
        c=c+(renk(ipek)-c)*isik[...,None]
        if golgeR: c=c+(renk(golgeR)-c)*(golge[...,None]*golgeK)
        else: c=c*(1-golge[...,None]*golgeK)
    # ince tane (bantlasma olmasin)
    c=c+rng.normal(0,0.006,(H,W,1)).astype(np.float32)
    img=Image.fromarray((np.clip(c,0,1)*255+0.5).astype(np.uint8))
    img.save(ad+'.png'); img.resize((1280,720),Image.LANCZOS).save(ad+'-k.png')
ciz('m-acik','#f7f6fb',[
    (0.10,0.85,0.45,0.40,'#f7b9d0',0.85),(0.45,0.95,0.50,0.35,'#c3baf0',0.80),
    (0.85,0.75,0.45,0.45,'#9fc1f4',0.85),(0.95,0.15,0.35,0.30,'#d7cdf6',0.55),
    (0.30,0.30,0.30,0.25,'#fde3d2',0.45)],'#ffffff',0.7, 0.6, '#b9b4ea')
ciz('m-koyu','#080a14',[
    (0.10,0.90,0.45,0.40,'#5a1f5e',0.70),(0.45,0.95,0.50,0.35,'#2c2a7a',0.75),
    (0.88,0.75,0.45,0.45,'#123f7a',0.80),(0.95,0.12,0.35,0.30,'#2b1d5c',0.60),
    (0.30,0.30,0.30,0.25,'#0f2a4a',0.45)],'#8fb4ff',0.22)
