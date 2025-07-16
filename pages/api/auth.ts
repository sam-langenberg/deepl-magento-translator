export default function handler(req: any, res: any) {
  res.setHeader('WWW-Authenticate', 'Basic realm="Restricted Area"');
  res.statusCode = 401;
  res.end('Authentication required');
}
