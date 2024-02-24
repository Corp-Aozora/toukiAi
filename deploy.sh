echo "Getting details of installed packages:"
for module in $(pip freeze | awk -F== '{print $1}'); do
    echo "Details for $module"
    pip show $module
done
