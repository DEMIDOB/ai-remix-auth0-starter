find . -type f | grep -v '.git' | grep -v '.env' | grep -v '.vscode' | grep -v '.ico' | grep -v 'prettier' | grep -v 'package-lock' | while read -r line; do
    echo '// '$line
    cat $line
done
