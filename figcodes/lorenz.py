import numpy as np

import scipy.integrate as spi
import matplotlib.pyplot as plt
from matplotlib.collections import LineCollection
from mpl_toolkits.mplot3d.art3d import Line3DCollection
from matplotlib.colors import ListedColormap

def lorenz(x, t0, sigma, beta, rho):
    xdot = sigma * (x[1] - x[0])
    ydot = x[0]*(rho - x[2]) - x[1]
    zdot = x[0]*x[1] - beta*x[2]
    return np.r_[xdot, ydot, zdot]

sigma = 10
beta = 8/3
rho = 28
np.random.seed(20)
x0 = np.random.randn(3)
t = np.linspace(0, 100, 10000)
x = spi.odeint(lorenz, x0, t, args=(sigma, beta, rho))

y = x[:, 1]
ydot = x[:, 0]*(rho - x[:, 2]) - x[:, 1]
yddot = sigma*rho*(x[:, 1] - x[:, 0]) - sigma*(x[:, 1] - x[:, 0])*x[:, 2] - x[:, 0]**2*x[:, 1] + beta*x[:, 0]*x[:, 2] - ydot

delta0 = beta**2*rho**2 - 3*y*(yddot + (sigma+beta+1)*ydot + (sigma+beta)*y)
delta1 = -2*beta**3*rho**3 + 9*beta*rho*y*(yddot + (sigma+beta+1)*ydot + (sigma+beta)*y) - 27*sigma*y**3*(ydot + y)
C = ((delta1 + np.emath.sqrt(delta1**2 - 4*delta0**3))/2) ** (1/3)

xi = (-1 + np.sqrt(3)*1j)/2
x_root1 = (beta*rho - C - delta0/C)/(3*y)
x_root2 = (beta*rho - xi*C - delta0/(xi*C))/(3*y)
x_root3 = (beta*rho - xi**2*C - delta0/(xi**2*C))/(3*y)
x_roots = np.vstack((x_root1, x_root2, x_root3))

branches = np.argmin(np.abs(x_roots - x[:, 0][None, :]), axis=0)

fig = plt.figure(dpi=500)
ax = plt.axes(projection='3d')
points = x[:, None, :]
segments = np.concatenate([points[:-1], points[1:]], axis=1)
colors = ['cornflowerblue', 'tomato', 'orange']
cmap = ListedColormap(colors)
lc = Line3DCollection(segments, cmap=cmap)
lc.set_array(branches)
lc.set_linewidth(1)
line = ax.add_collection3d(lc)
ax.set_xlim([-20, 20])
ax.set_ylim([-30, 30])
ax.set_zlim([0, 50])
plt.axis('off')
plt.grid(b=None)
#plt.savefig('./assets/images/favicon.png', bbox_inches='tight', pad_inches=0, transparent=True)

fig = plt.figure(figsize=(20, 1), dpi=500)
ax = plt.axes()
points = np.vstack([t, x[:, 1]]).T[:, None, :]
segments = np.concatenate([points[:-1], points[1:]], axis=1)
colors = ['cornflowerblue', 'orange', 'tomato']
cmap = ListedColormap(colors)
lc = LineCollection(segments, cmap=cmap)
lc.set_array(branches)
lc.set_linewidth(5)
line = ax.add_collection(lc)
ax.scatter(t[branches==0], x[branches==0, 1], color=colors[0], s=20)
ax.scatter(t[branches==1], x[branches==1, 1], color=colors[1], s=20)
ax.scatter(t[branches==2], x[branches==2, 1], color=colors[2], s=20)
plt.axis('off')
plt.xlim([20, 60])
plt.ylim([-30, 30])
plt.grid(b=None)
#plt.savefig('./assets/images/logo.png', bbox_inches='tight', pad_inches=0, transparent=True)
#plt.savefig('./assets/images/logo-darkmode.png', bbox_inches='tight', pad_inches=0, transparent=True)
