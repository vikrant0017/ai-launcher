# Maintainer: Vikrant Pradhan <pradhan.vikrant.17@gmail.com>
pkgname=ailauncher
pkgver=0.0.1
pkgrel=1
pkgdesc="It is an AI launcher"
arch=('x86_64')
# url=""
# license=('MIT')
depends=()
# makedepends=()
# optdepends=()
source=(${pkgname}-${pkgver}.tar.gz)
sha256sums=('SKIP')  # Replace with actual checksum

build() {
    cd "$srcdir/frontend"
    pnpm install
    pnpm make
    
    cd "$srcdir/backend"
    uv sync
    uv run -- pyinstaller server.spec
}

package() {
    # Create directory with required permission
    install -dm755 "$pkgdir/usr/lib/$pkgname"
    cp -a "$srcdir/frontend/out/ai-launcher-linux-x64/resources/." "$pkgdir/usr/lib/$pkgname/"

    # Assuming the extracted tarball has app.asar at top level
    cp -a "$srcdir/backend/dist/server/." "$pkgdir/usr/lib/$pkgname/"
    chmod +x "$pkgdir/usr/lib/$pkgname/server"

    # Create launcher script in /usr/bin/
    install -dm755 "$pkgdir/usr/bin"
    cat > "$pkgdir/usr/bin/$pkgname" <<EOF
#!/bin/sh
exec /usr/bin/electron34 /usr/lib/$pkgname/app.asar "\$@"
EOF
    chmod +x "$pkgdir/usr/bin/$pkgname"
}