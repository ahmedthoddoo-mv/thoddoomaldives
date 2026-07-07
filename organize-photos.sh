#!/bin/bash

mkdir -p public/images/homepage
mkdir -p public/images/stay
mkdir -p public/images/rooms
mkdir -p public/images/transfer
mkdir -p public/images/experiences
mkdir -p public/images/restaurants
mkdir -p public/images/beaches
mkdir -p public/images/island

echo ""
echo "=== iThoddoo Maldives Photo Organizer ==="
echo ""

echo "How many homepage photos?"
read homepage

for ((i=1;i<=homepage;i++))
do
    read -p "Drag homepage photo #$i here: " file
    file=$(echo "$file" | sed 's/\\//g')
    cp "$file" "public/images/homepage/hero-$i.jpg"
done

echo ""
echo "Homepage completed."
echo ""

echo "Finished!"
echo ""
echo "Now copy the remaining photos manually into:"
echo "public/images/stay"
echo "public/images/rooms"
echo "public/images/transfer"
echo "public/images/experiences"
echo "public/images/restaurants"
echo "public/images/beaches"
echo "public/images/island"
