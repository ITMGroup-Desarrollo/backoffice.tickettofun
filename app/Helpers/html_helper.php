<?php

/**
 * This file is part of the SealCMS.
 */

// --------------------------------------------------------------------

/**
 * CodeIgniter HTML Helpers
 */
if (! function_exists('meta'))
{
	/**
     * Generates meta tags from an array of key/values
     *
     * @param	array  $name
     *
     * @return	string
     */
    function meta($meta = []): string
    {
        return '<meta' . stringify_attributes($meta) . ">\n";
    }
}

// ------------------------------------------------------------------------

if ( ! function_exists('custom'))
{
    /**
     * Generates custom HTML tag
     *
     * @param  string  $tag
     * @param  mixed   $attributes string, array
     * @param  string  $content
     * @param  string  $complement
     *
     * @return string
     */
    function custom($tag = '', $attributes = '', $content = '', $complement = ''): string
    {
        $out = '';
        if ( ! empty($tag))
        {
            $out .= '<' . $tag;
            $out .= stringify_attributes($attributes) . ">\n";

            $out.= ( ! empty($complement)) ? '</' . $tag .'> ' . $complement
                        : $content . '</' . $tag .">\n";
        }

        return $out;
    }
}
