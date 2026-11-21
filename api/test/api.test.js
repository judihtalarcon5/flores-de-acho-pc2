import test from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../src/app.js';
const server = app.listen(0);
const base = `http://127.0.0.1:${server.address().port}`;
const request = async (path, method='GET', body, token) => {
 const r = await fetch(base+path,{method,headers:{'content-type':'application/json',...(token?{authorization:`Bearer ${token}`}:{})},...(body?{body:JSON.stringify(body)}:{})});
 return {status:r.status,data:await r.json()};
};
test('salud y catálogo', async () => {
 assert.equal((await request('/api/health')).status,200);
 assert.equal((await request('/api/products')).data.length,4);
 assert.equal((await request('/api/products?search=rosas')).data.length,1);
});
test('registro, login, pedido e historial', async () => {
 const email=`test-${Date.now()}@example.com`;
 assert.equal((await request('/api/register','POST',{name:'Cliente',email,password:'Password123'})).status,201);
 const login=await request('/api/login','POST',{email,password:'Password123'});
 assert.equal(login.status,200);
 const token=login.data.token;
 assert.equal((await request('/api/orders')).status,401);
 assert.equal((await request('/api/orders','POST',{items:[{id:1,quantity:2}],address:'Lima, Rímac, Perú'},token)).data.total,70);
 assert.equal((await request('/api/orders','GET',undefined,token)).data.length,1);
});
test.after(()=>server.close());
