import numpy as np, matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle, FancyArrowPatch, Circle, Wedge, Polygon
NAVY="#0F1C2E"; TEAL="#1B998B"; AMBER="#E8913A"; RED="#D1495B"; SLATE="#6C8EAD"; GREY="#9AA5B1"; LIGHT="#EEF2F6"
plt.rcParams.update({"font.family":"DejaVu Sans","font.size":13,"axes.edgecolor":"#B8C2CC","axes.labelcolor":NAVY,"xtick.color":NAVY,"ytick.color":NAVY,
  "axes.spines.top":False,"axes.spines.right":False,"axes.grid":True,"grid.color":"#E3E8EE","grid.linewidth":0.8,"axes.titleweight":"bold","axes.titlesize":14,"axes.titlecolor":NAVY,"text.color":NAVY,"savefig.dpi":200})
mu=3.986004418e14;Re=6378.137e3;a=Re+550e3;n=np.sqrt(mu/a**3);meq=2.0;H=550e3

# 1 geometry
fig,ax=plt.subplots(figsize=(6.2,6.6));ax.set_axis_off();ax.set_xlim(-3,3);ax.set_ylim(-3.6,3.4)
t=np.linspace(-1,1,200);ax.fill_between(3.4*t,-3.6,-3.6+0.55-0.35*t**2,color="#2E6F95",alpha=.9);ax.text(0,-3.35,"Earth",ha="center",color="white",fontsize=13,fontweight="bold")
ax.plot([0,0],[-2.6,3.1],ls=(0,(4,4)),color=GREY,lw=1.2);ax.text(0.12,3.05,"local vertical",color=GREY,fontsize=11)
for y,lab,col in ((2.0,"Half B (upper)",SLATE),(-1.6,"Half A (lower)",TEAL)):
    ax.add_patch(Rectangle((-0.28,y-0.45),0.56,0.9,fc=col,ec=NAVY,lw=1.5,zorder=3));ax.text(0.5,y,lab,va="center",fontsize=13,fontweight="bold")
for dx in (-0.15,0,0.15): ax.plot([dx,dx],[-1.15,1.55],color=NAVY,lw=1.4,zorder=2)
ax.annotate("",xy=(-1.0,2.9),xytext=(-1.0,2.0),arrowprops=dict(arrowstyle="-|>",color=AMBER,lw=2.5,mutation_scale=18))
ax.annotate("",xy=(-1.0,-2.5),xytext=(-1.0,-1.6),arrowprops=dict(arrowstyle="-|>",color=AMBER,lw=2.5,mutation_scale=18))
ax.text(-1.15,2.45,"pulled\noutward",ha="right",va="center",color=AMBER,fontsize=11);ax.text(-1.15,-2.05,"pulled\ninward",ha="right",va="center",color=AMBER,fontsize=11)
ax.annotate("",xy=(1.9,1.55),xytext=(1.9,-1.15),arrowprops=dict(arrowstyle="<->",color=NAVY,lw=1.4));ax.text(2.02,0.2,"L = 500 m\nto 1 km",va="center",fontsize=13,fontweight="bold")
ax.text(-0.4,0.2,"3 tethers",ha="right",va="center",fontsize=11,color=NAVY)
ax.annotate("",xy=(2.9,-2.7),xytext=(1.6,-2.7),arrowprops=dict(arrowstyle="-|>",color=NAVY,lw=1.4));ax.text(2.25,-2.55,"flight",ha="center",fontsize=11)
fig.savefig("fig_geometry.png",bbox_inches="tight",transparent=True);plt.close(fig)

# 2 deployment
fig,ax=plt.subplots(figsize=(8.4,4.6))
lam=0.5*n
for Lf,col in ((1000,TEAL),(500,SLATE)):
    t=np.linspace(0,5*3600,600);L=np.minimum(np.exp(lam*t),Lf);ax.plot(t/3600,L,color=col,lw=2.6,label=f"controlled to {Lf} m")
    tf=np.log(Lf)/lam;ax.plot(tf/3600,Lf,"o",color=col);ax.annotate(f"{tf/3600:.1f} h",(tf/3600,Lf),xytext=(6,-18),textcoords="offset points",color=col,fontweight="bold")
tt=np.linspace(0,1.4*3600,300);ax.plot(tt/3600,np.minimum(0.2*np.cosh(np.sqrt(3)*n*tt),1100),ls="--",color=RED,lw=2,label="free (no brake): 75–81 min,\nends at 1–1.9 m/s and tumbles")
ax.set_xlabel("time [h]");ax.set_ylabel("separation L [m]");ax.set_ylim(0,1100);ax.set_xlim(0,5);ax.legend(frameon=False,loc="upper left",bbox_to_anchor=(0.3,1.0),fontsize=11)
fig.savefig("fig_deploy.png",bbox_inches="tight");plt.close(fig)

# 3 diagonal
fig,ax=plt.subplots(figsize=(8.4,4.6))
phi=np.radians(np.linspace(0.5,60,200))
for L,col in ((1000,TEAL),(500,SLATE)):
    I=meq*L**2;ax.plot(np.degrees(phi),3*n*n*I*np.sin(phi)*np.cos(phi),color=col,lw=2.6,label=f"torque to hold the tilt, L = {L} m")
ax.axhline(1e-3,color=RED,lw=2,ls="--");ax.text(31,1.4e-3,"one CubeSat reaction wheel ≈ 0.001 N·m",color=RED,fontsize=11)
ax.set_yscale("log");ax.set_ylim(1e-4,20);ax.set_xlabel("tilt from vertical [°]");ax.set_ylabel("torque [N·m]");ax.legend(frameon=False,loc="lower right",fontsize=11)
fig.savefig("fig_diagonal.png",bbox_inches="tight");plt.close(fig)

# 4 IMU drift
fig,ax=plt.subplots(figsize=(8.4,4.6))
t=np.linspace(0,6,300)
for r,lab,col in ((10,"low-cost MEMS gyro, 10°/h",RED),(1,"good MEMS gyro, 1°/h",AMBER),(0.1,"tactical gyro, 0.1°/h",SLATE)):
    ax.plot(t,r*t,lw=2.6,color=col,label=lab)
ax.axhline(0.005,color=TEAL,lw=2.6);ax.text(0.1,0.0075,"star tracker, any time ≈ 0.005°",color=TEAL,fontsize=11,fontweight="bold")
ax.axhspan(0.01,0.05,color=TEAL,alpha=.08);ax.text(0.1,0.03,"needed to map images: 0.01–0.05°",fontsize=10,color=NAVY,va="center")
ax.set_yscale("log");ax.set_ylim(1e-3,100);ax.set_xlim(0,6);ax.set_xlabel("time since the 'zero' was set [h]");ax.set_ylabel("attitude error [°]")
ax.axvline(1.595,color=GREY,lw=1,ls=":");ax.text(1.65,30,"1 orbit",color=GREY,fontsize=10)
ax.legend(frameon=False,loc="lower right",fontsize=11)
fig.savefig("fig_imu.png",bbox_inches="tight");plt.close(fig)

# 5 parallax geometry
fig,axs=plt.subplots(1,2,figsize=(9.6,4.4))
for ax,(B,title,ang) in zip(axs,((0.05,"Baseline 1 km\n(tether, even if horizontal)","0.1° between views"),(2.6,"Baseline 234 km\n(fore/aft pointing, ±12°)","24° between views"))):
    ax.set_axis_off();ax.set_xlim(-3,3);ax.set_ylim(-0.6,4.2)
    ax.fill_between([-3,3],-0.6,0,color="#CFE3D4");mx=np.array([-0.7,0,0.7]);ax.add_patch(Polygon([[-0.8,0],[0,0.9],[0.8,0]],fc="#8A7F6B",ec=NAVY,lw=1))
    for x in (-B/2,B/2):
        ax.add_patch(Rectangle((x-0.12,3.3),0.24,0.3,fc=SLATE,ec=NAVY));ax.plot([x,0],[3.3,0.9],color=AMBER,lw=2)
    ax.set_title(title,fontsize=13);ax.text(0,-0.4,ang,ha="center",fontsize=13,fontweight="bold",color=RED if B<1 else TEAL)
fig.savefig("fig_parallax.png",bbox_inches="tight",transparent=True);plt.close(fig)

# 6 stereo error vs baseline
fig,ax=plt.subplots(figsize=(8.4,4.6))
B=np.logspace(2,6,300)
for g,col,ls in ((5,TEAL,"-"),(20,SLATE,"--")):
    ax.plot(B/1e3,0.3*g/(B/H),color=col,lw=2.6,ls=ls,label=f"camera {g} m/pixel")
ax.axhspan(1,100,color=TEAL,alpha=.08);ax.text(0.12,25,"useful for mountains and relief (≤ 100 m)",fontsize=11,color=NAVY)
for Bk,lab,c,ha,f in ((0.5,"500 m",RED,"right",0.93),(1,"1 km",RED,"left",1.08),(234,"fore/aft\n234 km",TEAL,"left",1.08)):
    ax.axvline(Bk,color=c,lw=1.4,ls=":");ax.text(Bk*f,2.0e4,lab,color=c,fontsize=11,fontweight="bold",va="top",ha=ha)
ax.set_xscale("log");ax.set_yscale("log");ax.set_xlim(0.1,1000);ax.set_ylim(1,3e4);ax.set_xlabel("baseline between the two photos [km]");ax.set_ylabel("height error [m]")
ax.legend(frameon=False,loc="lower left",fontsize=11)
fig.savefig("fig_stereo.png",bbox_inches="tight");plt.close(fig)
print("ok")
